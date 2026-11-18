import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const jar = new Map<string, string>();

vi.mock('next/headers', () => ({
    cookies: vi.fn(async () => ({
        get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
        set: (name: string, value: string) => {
            jar.set(name, value);
        },
        delete: (name: string) => {
            jar.delete(name);
        },
    })),
}));

import { resetServerEnvForTests } from '@/shared/server/env';
import { refreshAuthSession, resetRefreshCacheForTests } from '@/shared/server/upstream';
import { POST as login } from '../auth/login/route';
import { POST as register } from '../auth/register/route';
import { POST as refresh } from '../auth/refresh/route';
import { POST as logout } from '../auth/logout/route';
import { POST as forgotPassword } from '../auth/forgot-password/route';
import { POST as resetPassword } from '../auth/reset-password/route';

const fetchMock = vi.fn();
const context = { params: Promise.resolve({}) };

function post(path: string, body: unknown = {}, headers: Record<string, string> = {}): NextRequest {
    return new NextRequest(`http://localhost:3000${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify(body),
    });
}

function rateLimited(retryAfter: string): Response {
    return new Response(
        JSON.stringify({ code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Retry after 30 seconds.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': retryAfter } }
    );
}

function upstreamBodies(path: string): unknown[] {
    return fetchMock.mock.calls
        .filter(([url]) => (url as URL).pathname === path)
        .map(([, init]) => JSON.parse(init.body as string));
}

describe('auth BFF contract', () => {
    beforeEach(() => {
        jar.clear();
        fetchMock.mockReset();
        global.fetch = fetchMock as unknown as typeof fetch;
        resetServerEnvForTests();
        resetRefreshCacheForTests();
    });

    describe('POST /api/auth/refresh', () => {
        it('stores the rotated refresh token returned by the API', async () => {
            jar.set('refresh_token', 'r1');
            fetchMock.mockResolvedValueOnce(
                new Response(JSON.stringify({ accessToken: 'a2', refreshToken: 'r2', expiresIn: 900, username: 'alice' }), {
                    status: 200,
                })
            );

            const response = await refresh(post('/api/auth/refresh'), context);

            expect(response.status).toBe(200);
            expect(jar.get('refresh_token')).toBe('r2');
            expect(jar.get('access_token')).toBe('a2');
            expect(upstreamBodies('/api/v1/auth/refresh')).toEqual([{ refreshToken: 'r1' }]);
        });

        it('does not call the API twice with the same token when requests overlap', async () => {
            jar.set('refresh_token', 'r1');
            fetchMock.mockResolvedValue(
                new Response(JSON.stringify({ accessToken: 'a2', refreshToken: 'r2', expiresIn: 900 }), { status: 200 })
            );

            await Promise.all([
                refresh(post('/api/auth/refresh'), context),
                refresh(post('/api/auth/refresh'), context),
            ]);

            expect(upstreamBodies('/api/v1/auth/refresh')).toEqual([{ refreshToken: 'r1' }]);
        });

        it('clears both cookies and answers 401 when the API answers 401 INVALID_TOKEN', async () => {
            jar.set('access_token', 'a1');
            jar.set('refresh_token', 'reused');
            fetchMock.mockResolvedValueOnce(
                new Response(JSON.stringify({ code: 'INVALID_TOKEN', message: 'Invalid refresh token' }), { status: 401 })
            );

            const response = await refresh(post('/api/auth/refresh'), context);

            expect(response.status).toBe(401);
            expect(jar.has('access_token')).toBe(false);
            expect(jar.has('refresh_token')).toBe(false);
        });

        it('keeps the cookies and answers 503 on a transient upstream failure', async () => {
            jar.set('access_token', 'a1');
            jar.set('refresh_token', 'r1');
            fetchMock.mockResolvedValueOnce(new Response('{}', { status: 503 }));

            const response = await refresh(post('/api/auth/refresh'), context);

            expect(response.status).toBe(503);
            expect(jar.get('refresh_token')).toBe('r1');
            expect(jar.get('access_token')).toBe('a1');
        });

        it('passes a 429 and its Retry-After through without clearing the cookies', async () => {
            jar.set('refresh_token', 'r1');
            fetchMock.mockResolvedValueOnce(rateLimited('17'));

            const response = await refresh(post('/api/auth/refresh'), context);

            expect(response.status).toBe(429);
            expect(response.headers.get('Retry-After')).toBe('17');
            expect(jar.get('refresh_token')).toBe('r1');
        });

        it('answers 401 without calling the API when there is no refresh cookie', async () => {
            const response = await refresh(post('/api/auth/refresh'), context);

            expect(response.status).toBe(401);
            expect(fetchMock).not.toHaveBeenCalled();
        });
    });

    describe('POST /api/auth/logout', () => {
        it('revokes the refresh token upstream and then clears the cookies', async () => {
            jar.set('access_token', 'a1');
            jar.set('refresh_token', 'r1');
            fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

            const response = await logout(post('/api/auth/logout'), context);

            expect(response.status).toBe(200);
            expect(upstreamBodies('/api/v1/auth/logout')).toEqual([{ refreshToken: 'r1' }]);
            const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
            expect(headers.Authorization).toBeUndefined();
            expect(jar.has('access_token')).toBe(false);
            expect(jar.has('refresh_token')).toBe(false);
        });

        it('forgets the shared refresh outcome of the logged-out token', async () => {
            jar.set('refresh_token', 'r-shared');
            fetchMock.mockResolvedValueOnce(
                new Response(JSON.stringify({ accessToken: 'a2', refreshToken: 'r2', expiresIn: 900 }), { status: 200 })
            );
            await refreshAuthSession('r-shared');
            fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

            await logout(post('/api/auth/logout'), context);
            fetchMock.mockResolvedValueOnce(new Response('{}', { status: 401 }));
            const replay = await refreshAuthSession('r-shared');

            expect(replay.kind).toBe('rejected');
        });

        it('clears the cookies even when the upstream call fails', async () => {
            jar.set('access_token', 'a1');
            jar.set('refresh_token', 'r1');
            fetchMock.mockResolvedValueOnce(new Response('{}', { status: 500 }));

            const failed = await logout(post('/api/auth/logout'), context);

            expect(failed.status).toBe(200);
            expect(jar.has('refresh_token')).toBe(false);

            jar.set('access_token', 'a2');
            jar.set('refresh_token', 'r2');
            fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));

            const unreachable = await logout(post('/api/auth/logout'), context);

            expect(unreachable.status).toBe(200);
            expect(jar.has('access_token')).toBe(false);
            expect(jar.has('refresh_token')).toBe(false);
        });

        it('skips the upstream call when there is no refresh cookie', async () => {
            jar.set('access_token', 'a1');

            const response = await logout(post('/api/auth/logout'), context);

            expect(response.status).toBe(200);
            expect(fetchMock).not.toHaveBeenCalled();
            expect(jar.has('access_token')).toBe(false);
        });

        it('rejects cross-origin requests without touching the session', async () => {
            jar.set('refresh_token', 'r1');

            const response = await logout(post('/api/auth/logout', {}, { origin: 'http://evil.example' }), context);

            expect(response.status).toBe(403);
            expect(fetchMock).not.toHaveBeenCalled();
            expect(jar.get('refresh_token')).toBe('r1');
        });

        it('rejects non-JSON requests without touching the session', async () => {
            jar.set('refresh_token', 'r1');

            const response = await logout(post('/api/auth/logout', {}, { 'content-type': 'text/plain' }), context);

            expect(response.status).toBe(415);
            expect(fetchMock).not.toHaveBeenCalled();
            expect(jar.get('refresh_token')).toBe('r1');
        });
    });

    describe('rate limiting', () => {
        const endpoints = [
            ['login', login, '/api/auth/login'],
            ['register', register, '/api/auth/register'],
            ['forgot-password', forgotPassword, '/api/auth/forgot-password'],
            ['reset-password', resetPassword, '/api/auth/reset-password'],
        ] as const;

        it.each(endpoints)('passes the 429 and Retry-After of %s through the BFF', async (_name, handler, path) => {
            fetchMock.mockResolvedValueOnce(rateLimited('30'));

            const response = await handler(post(path, { a: 1 }), context);
            const body = await response.json();

            expect(response.status).toBe(429);
            expect(response.headers.get('Retry-After')).toBe('30');
            expect(body.code).toBe('RATE_LIMIT_EXCEEDED');
            expect(jar.has('access_token')).toBe(false);
        });
    });
});
