import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createToken } from '@/shared/server/__tests__/token-factory';

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
import { resetRefreshCacheForTests } from '@/shared/server/upstream';
import { GET as me } from '../auth/me/route';

const fetchMock = vi.fn();
const context = { params: Promise.resolve({}) };

function get(): NextRequest {
    return new NextRequest('http://localhost:3000/api/auth/me');
}

function jsonResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('GET /api/auth/me', () => {
    beforeEach(() => {
        jar.clear();
        fetchMock.mockReset();
        global.fetch = fetchMock as unknown as typeof fetch;
        resetServerEnvForTests();
        resetRefreshCacheForTests();
    });

    it('returns the principal from a valid access token without calling the API', async () => {
        jar.set('access_token', await createToken({ userId: 12, roles: ['USER', 'ADMIN'] }));

        const response = await me(get(), context);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toMatchObject({ id: 12, username: 'alice', roles: ['USER', 'ADMIN'] });
        expect(typeof body.exp).toBe('number');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('answers 401 for an anonymous visitor without any refresh attempt', async () => {
        const response = await me(get(), context);

        expect(response.status).toBe(401);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('renews an expired access token from the refresh cookie and stores the rotated pair', async () => {
        jar.set('access_token', await createToken({ expiresIn: '-1m' }));
        jar.set('refresh_token', 'refresh-1');
        const fresh = await createToken({ userId: 7 });
        fetchMock.mockResolvedValueOnce(
            jsonResponse(200, { accessToken: fresh, refreshToken: 'refresh-2', expiresIn: 900 })
        );

        const response = await me(get(), context);

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ id: 7, username: 'alice' });
        expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toEqual({ refreshToken: 'refresh-1' });
        expect(jar.get('refresh_token')).toBe('refresh-2');
        expect(jar.get('access_token')).toBe(fresh);
    });

    it('answers 401 and clears the cookies when the refresh token is rejected', async () => {
        jar.set('access_token', await createToken({ expiresIn: '-1m' }));
        jar.set('refresh_token', 'dead');
        fetchMock.mockResolvedValueOnce(jsonResponse(401, { code: 'INVALID_TOKEN' }));

        const response = await me(get(), context);

        expect(response.status).toBe(401);
        expect(jar.has('refresh_token')).toBe(false);
        expect(jar.has('access_token')).toBe(false);
    });

    it('answers 401 when the access token is signed with another secret', async () => {
        jar.set('access_token', await createToken({ secret: 'another-secret-that-is-long-enough-0123456789' }));

        const response = await me(get(), context);

        expect(response.status).toBe(401);
    });

    it('does not report a refresh outage as a valid session', async () => {
        jar.set('refresh_token', 'refresh-1');
        fetchMock.mockResolvedValueOnce(jsonResponse(503, {}));

        const response = await me(get(), context);

        expect(response.status).toBe(401);
        expect(jar.get('refresh_token')).toBe('refresh-1');
    });
});
