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
import { GET as start } from '../../oauth/[provider]/route';
import { GET as callback } from '../../callback/[provider]/route';

const fetchMock = vi.fn();
const params = (provider: string) => ({ params: Promise.resolve({ provider }) });

function startRequest(): NextRequest {
    return new NextRequest('http://localhost:3000/api/auth/oauth/google');
}

function callbackRequest(search: string, cookie?: string): NextRequest {
    return new NextRequest(`http://localhost:3000/api/auth/callback/google${search}`, {
        headers: cookie ? { cookie } : undefined,
    });
}

function authorizeRedirect(state: string | null): Response {
    const target = new URL('https://accounts.google.com/o/oauth2/auth?client_id=x');
    if (state) target.searchParams.set('state', state);
    return new Response(null, { status: 302, headers: { location: target.toString() } });
}

function loginError(response: Response): string | null {
    const location = response.headers.get('location');
    return location ? new URL(location).searchParams.get('error') : null;
}

describe('OAuth login flow binding', () => {
    beforeEach(() => {
        jar.clear();
        fetchMock.mockReset();
        global.fetch = fetchMock as unknown as typeof fetch;
        resetServerEnvForTests();
    });

    it('stores the authorize state in a short-lived httpOnly cookie when starting', async () => {
        fetchMock.mockResolvedValueOnce(authorizeRedirect('abc123'));

        const response = await start(startRequest(), params('google'));
        const setCookie = response.headers.get('set-cookie') ?? '';

        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toContain('accounts.google.com');
        expect(setCookie).toContain('oauth_state=abc123');
        expect(setCookie.toLowerCase()).toContain('httponly');
        expect(setCookie.toLowerCase()).toContain('samesite=lax');
        expect(setCookie).toContain('Max-Age=600');
    });

    it('refuses to start when the authorize redirect carries no state', async () => {
        fetchMock.mockResolvedValueOnce(authorizeRedirect(null));

        const response = await start(startRequest(), params('google'));

        expect(loginError(response)).toBe('oauth_unavailable');
        expect(response.headers.get('set-cookie')).toBeNull();
    });

    it('rejects a callback without the state cookie', async () => {
        const response = await callback(callbackRequest('?code=c&state=abc123'), params('google'));

        expect(loginError(response)).toBe('invalid_state');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects a callback whose state differs from the cookie and clears the cookie', async () => {
        const response = await callback(callbackRequest('?code=c&state=forged', 'oauth_state=abc123'), params('google'));

        expect(loginError(response)).toBe('invalid_state');
        expect(response.headers.get('set-cookie')).toContain('oauth_state=;');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([
        ['local_account_unverified', 409],
        ['account_already_linked', 409],
        ['authorization_denied', 401],
    ])('redirects an API %s failure to the login page with that code', async (code, status) => {
        fetchMock.mockResolvedValueOnce(
            new Response(JSON.stringify({ code, message: 'internal wording' }), {
                status,
                headers: { 'Content-Type': 'application/json' },
            })
        );

        const response = await callback(callbackRequest('?code=c&state=abc123', 'oauth_state=abc123'), params('google'));

        expect(loginError(response)).toBe(code);
    });

    it('never reflects an unknown API message into the login redirect', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(JSON.stringify({ code: 'SOMETHING_NEW', message: '<script>alert(1)</script>' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            })
        );

        const response = await callback(callbackRequest('?code=c&state=abc123', 'oauth_state=abc123'), params('google'));

        expect(loginError(response)).toBe('callback_failed');
    });

    it('accepts a matching state, signs in and deletes the cookie', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(JSON.stringify({ accessToken: 'a', refreshToken: 'r' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        );

        const response = await callback(callbackRequest('?code=c&state=abc123', 'oauth_state=abc123'), params('google'));

        expect(new URL(response.headers.get('location')!).pathname).toBe('/');
        expect(response.headers.get('set-cookie')).toContain('oauth_state=;');
        expect(jar.get('access_token')).toBe('a');
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
