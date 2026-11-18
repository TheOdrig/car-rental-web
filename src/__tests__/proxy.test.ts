import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { resetServerEnvForTests } from '@/shared/server/env';
import { createToken } from '@/shared/server/__tests__/token-factory';
import { proxy } from '../proxy';

const fetchMock = vi.fn();

function requestFor(path: string, cookies: Record<string, string> = {}): NextRequest {
    const header = Object.entries(cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');

    return new NextRequest(`http://localhost:3000${path}`, header ? { headers: { cookie: header } } : undefined);
}

function location(response: Response): string | null {
    const value = response.headers.get('location');
    return value ? new URL(value).pathname : null;
}

describe('proxy', () => {
    beforeEach(() => {
        resetServerEnvForTests();
        fetchMock.mockReset();
        global.fetch = fetchMock as unknown as typeof fetch;
    });

    describe('public routes', () => {
        it('lets anonymous visitors through', async () => {
            const response = await proxy(requestFor('/cars/5'));

            expect(response.headers.get('location')).toBeNull();
            expect(response.status).toBe(200);
        });
    });

    describe('guest-only routes', () => {
        it('redirects a signed-in user away from /login', async () => {
            const token = await createToken();
            const response = await proxy(requestFor('/login', { access_token: token }));

            expect(response.status).toBe(307);
            expect(location(response)).toBe('/');
        });

        it('shows the login page to anonymous visitors', async () => {
            const response = await proxy(requestFor('/login'));

            expect(response.status).toBe(200);
        });

        it('shows the login page when the access token is forged', async () => {
            const forged = await createToken({ secret: 'another-secret-with-at-least-32-chars!!' });
            const response = await proxy(requestFor('/register', { access_token: forged }));

            expect(response.status).toBe(200);
        });

        it('keeps /reset-password reachable for signed-in users', async () => {
            const token = await createToken();
            const response = await proxy(requestFor('/reset-password', { access_token: token }));

            expect(response.status).toBe(200);
        });
    });

    describe('protected pages', () => {
        it('redirects anonymous visitors to login with the return path', async () => {
            const response = await proxy(requestFor('/rentals?tab=active'));

            expect(response.status).toBe(307);
            const target = new URL(response.headers.get('location')!);
            expect(target.pathname).toBe('/login');
            expect(target.searchParams.get('callbackUrl')).toBe('/rentals?tab=active');
        });

        it('lets a verified user through', async () => {
            const token = await createToken();
            const response = await proxy(requestFor('/dashboard', { access_token: token }));

            expect(response.status).toBe(200);
            expect(response.headers.get('location')).toBeNull();
        });

        it('does not trust a token with an invalid signature', async () => {
            const forged = await createToken({ secret: 'another-secret-with-at-least-32-chars!!' });
            const response = await proxy(requestFor('/dashboard', { access_token: forged }));

            expect(location(response)).toBe('/login');
        });

        it('renews an expired session with the refresh token and forwards fresh cookies', async () => {
            const fresh = await createToken();
            fetchMock.mockResolvedValueOnce(
                new Response(JSON.stringify({ accessToken: fresh, refreshToken: 'r2', expiresIn: 900 }), { status: 200 })
            );

            const response = await proxy(requestFor('/dashboard', { refresh_token: 'r1' }));

            expect(response.status).toBe(200);
            expect(response.headers.get('set-cookie')).toContain('access_token=');
            expect(response.headers.get('x-middleware-request-cookie')).toContain(`access_token=${fresh}`);
        });

        it('redirects to login and clears cookies when the refresh token is rejected', async () => {
            fetchMock.mockResolvedValueOnce(new Response('{}', { status: 401 }));

            const response = await proxy(requestFor('/dashboard', { refresh_token: 'stale' }));

            expect(location(response)).toBe('/login');
            expect(response.headers.get('set-cookie')).toContain('refresh_token=;');
        });
    });

    describe('transient refresh failures', () => {
        it.each([503, 429])('keeps the cookies on a page redirect when the refresh answers %i', async (status) => {
            fetchMock.mockResolvedValueOnce(new Response('{}', { status }));

            const response = await proxy(requestFor('/dashboard', { refresh_token: `slow-${status}` }));

            expect(location(response)).toBe('/login');
            expect(response.headers.get('set-cookie')).toBeNull();
        });

        it('keeps the cookies when the refresh times out', async () => {
            fetchMock.mockRejectedValueOnce(new DOMException('timed out', 'TimeoutError'));

            const response = await proxy(requestFor('/dashboard', { refresh_token: 'timeout-token' }));

            expect(location(response)).toBe('/login');
            expect(response.headers.get('set-cookie')).toBeNull();
        });

        it('answers 401 for the admin API without clearing the cookies on a transient failure', async () => {
            fetchMock.mockResolvedValueOnce(new Response('{}', { status: 503 }));

            const response = await proxy(requestFor('/api/admin/users', { refresh_token: 'admin-transient' }));

            expect(response.status).toBe(401);
            expect(response.headers.get('set-cookie')).toBeNull();
        });

        it('clears the cookies on the admin API when the refresh token is rejected', async () => {
            fetchMock.mockResolvedValueOnce(new Response('{}', { status: 401 }));

            const response = await proxy(requestFor('/api/admin/users', { refresh_token: 'admin-dead' }));

            expect(response.status).toBe(401);
            expect(response.headers.get('set-cookie')).toContain('refresh_token=;');
        });

        it('does not replay a refresh token that was already rotated within the share window', async () => {
            const fresh = await createToken();
            fetchMock.mockResolvedValue(
                new Response(JSON.stringify({ accessToken: fresh, refreshToken: 'rotated', expiresIn: 900 }), { status: 200 })
            );

            await proxy(requestFor('/dashboard', { refresh_token: 'rotating-token' }));
            await proxy(requestFor('/dashboard', { refresh_token: 'rotating-token' }));

            expect(fetchMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('admin pages', () => {
        it('sends anonymous visitors to login', async () => {
            expect(location(await proxy(requestFor('/admin/dashboard')))).toBe('/login');
        });

        it('sends a signed-in non-admin to /forbidden', async () => {
            const token = await createToken({ roles: ['USER'] });

            expect(location(await proxy(requestFor('/admin/users', { access_token: token })))).toBe('/forbidden');
        });

        it('does not let a non-admin pass just because a refresh token exists', async () => {
            const userToken = await createToken({ roles: ['USER'] });
            fetchMock.mockResolvedValueOnce(
                new Response(JSON.stringify({ accessToken: userToken, refreshToken: 'r2', expiresIn: 900 }), {
                    status: 200,
                })
            );

            const response = await proxy(requestFor('/admin/users', { refresh_token: 'r1' }));

            expect(location(response)).toBe('/forbidden');
        });

        it('lets a verified admin through', async () => {
            const token = await createToken({ roles: ['ADMIN'] });
            const response = await proxy(requestFor('/admin/fleet', { access_token: token }));

            expect(response.status).toBe(200);
            expect(response.headers.get('location')).toBeNull();
        });

        it('does not treat lookalike paths as admin routes', async () => {
            const token = await createToken({ roles: ['USER'] });
            const response = await proxy(requestFor('/administrator', { access_token: token }));

            expect(location(response)).toBeNull();
        });
    });

    describe('admin API', () => {
        it('answers 401 json without credentials', async () => {
            const response = await proxy(requestFor('/api/admin/users'));

            expect(response.status).toBe(401);
        });

        it('answers 403 json for a non-admin session', async () => {
            const token = await createToken({ roles: ['USER'] });
            const response = await proxy(requestFor('/api/admin/users', { access_token: token }));

            expect(response.status).toBe(403);
        });

        it('refreshes an expired session and lets a verified admin through', async () => {
            const adminToken = await createToken({ roles: ['ADMIN'] });
            fetchMock.mockResolvedValueOnce(
                new Response(JSON.stringify({ accessToken: adminToken, refreshToken: 'r2', expiresIn: 900 }), {
                    status: 200,
                })
            );

            const response = await proxy(requestFor('/api/admin/users', { refresh_token: 'admin-r1' }));

            expect(response.status).toBe(200);
            expect(response.headers.get('x-middleware-request-cookie')).toContain(`access_token=${adminToken}`);
        });

        it('answers 403 when the refreshed session is not an admin', async () => {
            const userToken = await createToken({ roles: ['USER'] });
            fetchMock.mockResolvedValueOnce(
                new Response(JSON.stringify({ accessToken: userToken, refreshToken: 'r2', expiresIn: 900 }), {
                    status: 200,
                })
            );

            const response = await proxy(requestFor('/api/admin/users', { refresh_token: 'user-r1' }));

            expect(response.status).toBe(403);
        });

        it('answers 401 when only a refresh token exists and it is rejected', async () => {
            fetchMock.mockResolvedValueOnce(new Response('{}', { status: 401 }));

            const response = await proxy(requestFor('/api/admin/users', { refresh_token: 'dead' }));

            expect(response.status).toBe(401);
        });

        it('answers 401 for a forged access token', async () => {
            const forged = await createToken({ secret: 'another-secret-with-at-least-32-chars!!', roles: ['ADMIN'] });
            const response = await proxy(requestFor('/api/admin/users', { access_token: forged }));

            expect(response.status).toBe(401);
        });

        it('lets an admin through', async () => {
            const token = await createToken({ roles: ['ADMIN'] });
            const response = await proxy(requestFor('/api/admin/users', { access_token: token }));

            expect(response.status).toBe(200);
        });
    });
});
