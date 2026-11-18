import { describe, it, expect, vi, beforeEach } from 'vitest';

const jar = new Map<string, string>();
let incomingHeaders: Record<string, string> = {};

vi.mock('next/headers', () => ({
    headers: vi.fn(async () => new Headers(incomingHeaders)),
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

import { resetServerEnvForTests } from '../env';
import {
    buildUpstreamUrl,
    refreshAuthSession,
    forgetRefresh,
    refreshAuthTokens,
    renewAccessToken,
    resetRefreshCacheForTests,
    upstream,
} from '../upstream';

function jsonResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

const refreshed = { accessToken: 'fresh-access', refreshToken: 'fresh-refresh', expiresIn: 900 };

describe('upstream', () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        jar.clear();
        incomingHeaders = {};
        delete process.env.TRUSTED_PROXY_HOPS;
        fetchMock.mockReset();
        global.fetch = fetchMock as unknown as typeof fetch;
        resetServerEnvForTests();
        resetRefreshCacheForTests();
    });

    function lastHeaders(call = 0): Record<string, string> {
        return fetchMock.mock.calls[call][1].headers as Record<string, string>;
    }

    it('resolves paths against the server-side API_URL and forwards params', () => {
        const url = buildUpstreamUrl('/api/v1/cars', new URLSearchParams('a=1&a=2'));

        expect(url.toString()).toBe('http://localhost:8082/api/v1/cars?a=1&a=2');
    });

    it('sends the access token from the cookie as a bearer header', async () => {
        jar.set('access_token', 'tok');
        fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

        await upstream.get('/api/v1/cars');

        expect(lastHeaders().Authorization).toBe('Bearer tok');
    });

    it('does not attach credentials or refresh for anonymous calls', async () => {
        jar.set('access_token', 'tok');
        jar.set('refresh_token', 'ref');
        fetchMock.mockResolvedValueOnce(jsonResponse(401, { message: 'bad credentials' }));

        await expect(upstream.post('/api/v1/auth/login', { u: 1 }, { anonymous: true })).rejects.toMatchObject({
            status: 401,
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(lastHeaders().Authorization).toBeUndefined();
        expect(jar.get('refresh_token')).toBe('ref');
    });

    it('refreshes once on 401 and retries with the new token', async () => {
        jar.set('access_token', 'stale');
        jar.set('refresh_token', 'ref');
        fetchMock
            .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
            .mockResolvedValueOnce(jsonResponse(200, refreshed))
            .mockResolvedValueOnce(jsonResponse(200, { data: 1 }));

        const result = await upstream.get('/api/v1/rentals/me');

        expect(result).toEqual({ data: 1 });
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(lastHeaders(2).Authorization).toBe('Bearer fresh-access');
        expect(jar.get('access_token')).toBe('fresh-access');
        expect(jar.get('refresh_token')).toBe('fresh-refresh');
    });

    it('does not retry or refresh on 403', async () => {
        jar.set('access_token', 'tok');
        jar.set('refresh_token', 'ref');
        fetchMock.mockResolvedValueOnce(jsonResponse(403, { message: 'forbidden' }));

        await expect(upstream.get('/api/v1/admin/users')).rejects.toMatchObject({ status: 403 });

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('refreshes before the request when only a refresh token exists', async () => {
        jar.set('refresh_token', 'ref');
        fetchMock.mockResolvedValueOnce(jsonResponse(200, refreshed)).mockResolvedValueOnce(jsonResponse(200, {}));

        await upstream.get('/api/v1/rentals/me');

        expect(lastHeaders(1).Authorization).toBe('Bearer fresh-access');
    });

    it('clears the auth cookies when the refresh token is definitively rejected with 401 INVALID_TOKEN', async () => {
        jar.set('access_token', 'stale');
        jar.set('refresh_token', 'ref');
        fetchMock
            .mockResolvedValueOnce(jsonResponse(401, { code: 'AUTHENTICATION_FAILED', message: 'expired' }))
            .mockResolvedValueOnce(jsonResponse(401, { code: 'INVALID_TOKEN', message: 'Invalid refresh token' }));

        await expect(upstream.get('/api/v1/rentals/me')).rejects.toMatchObject({ status: 401 });

        expect(jar.has('access_token')).toBe(false);
        expect(jar.has('refresh_token')).toBe(false);
    });

    it.each([
        ['a server error', () => jsonResponse(503, {})],
        ['an internal error', () => jsonResponse(500, {})],
        ['a timeout', () => Promise.reject(new DOMException('timed out', 'TimeoutError'))],
        ['a rate limit', () => jsonResponse(429, { code: 'RATE_LIMIT_EXCEEDED' })],
        ['a network error', () => Promise.reject(new TypeError('fetch failed'))],
    ])('keeps the cookies when the refresh fails transiently with %s', async (_label, outcome) => {
        jar.set('access_token', 'stale');
        jar.set('refresh_token', 'ref');
        fetchMock.mockResolvedValueOnce(jsonResponse(401, { message: 'expired' })).mockImplementationOnce(async () => outcome());

        await expect(upstream.get('/api/v1/rentals/me')).rejects.toMatchObject({ status: 401 });

        expect(jar.get('access_token')).toBe('stale');
        expect(jar.get('refresh_token')).toBe('ref');
    });

    it('stores the rotated refresh token and never sends the old one again within the share window', async () => {
        jar.set('refresh_token', 'old-refresh');
        fetchMock.mockImplementation(async (url: URL) =>
            url.pathname === '/api/v1/auth/refresh' ? jsonResponse(200, refreshed) : jsonResponse(200, {})
        );

        await upstream.get('/api/v1/a');
        expect(jar.get('refresh_token')).toBe('fresh-refresh');

        jar.set('refresh_token', 'old-refresh');
        jar.delete('access_token');
        await upstream.get('/api/v1/b');

        const refreshBodies = fetchMock.mock.calls
            .filter(([url]) => (url as URL).pathname === '/api/v1/auth/refresh')
            .map(([, init]) => JSON.parse(init.body as string));
        expect(refreshBodies).toEqual([{ refreshToken: 'old-refresh' }]);
        expect(jar.get('refresh_token')).toBe('fresh-refresh');
    });

    it('serves a second sequential refresh with the same token from the cached rotated pair', async () => {
        fetchMock.mockResolvedValue(jsonResponse(200, refreshed));

        const first = await refreshAuthSession('old');
        const second = await refreshAuthSession('old');

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(first).toEqual({ kind: 'ok', tokens: refreshed });
        expect(second).toBe(first);
    });

    it('does not replay a token the API already rejected', async () => {
        fetchMock.mockImplementation(async () => jsonResponse(401, { code: 'INVALID_TOKEN' }));

        expect(await refreshAuthSession('dead')).toEqual({ kind: 'rejected' });
        expect(await refreshAuthSession('dead')).toEqual({ kind: 'rejected' });

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('stores the new refresh token for every successful renewal', async () => {
        jar.set('refresh_token', 'r0');
        fetchMock.mockResolvedValueOnce(jsonResponse(200, { accessToken: 'a1', refreshToken: 'r1', expiresIn: 900 }));

        expect(await renewAccessToken()).toBe('a1');
        expect(jar.get('refresh_token')).toBe('r1');

        fetchMock.mockResolvedValueOnce(jsonResponse(200, { accessToken: 'a2', refreshToken: 'r2', expiresIn: 900 }));

        expect(await renewAccessToken()).toBe('a2');
        expect(JSON.parse(fetchMock.mock.calls[1][1].body as string)).toEqual({ refreshToken: 'r1' });
        expect(jar.get('refresh_token')).toBe('r2');
    });

    it('reports a 429 refresh with its Retry-After and does not cache it', async () => {
        fetchMock
            .mockResolvedValueOnce(new Response('{}', { status: 429, headers: { 'Retry-After': '42' } }))
            .mockResolvedValueOnce(jsonResponse(200, refreshed));

        expect(await refreshAuthSession('ref')).toEqual({ kind: 'rate-limited', retryAfter: 42 });
        expect(await refreshAuthSession('ref')).toMatchObject({ kind: 'ok' });
    });

    it('does not treat 403 as a reason to refresh', async () => {
        jar.set('access_token', 'tok');
        jar.set('refresh_token', 'ref');
        fetchMock.mockResolvedValueOnce(jsonResponse(403, { code: 'ACCESS_DENIED' }));

        await expect(upstream.get('/api/v1/admin/users')).rejects.toMatchObject({ status: 403, code: 'ACCESS_DENIED' });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(jar.get('refresh_token')).toBe('ref');
    });

    it('exposes the error code and Retry-After of upstream failures', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(JSON.stringify({ code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json', 'Retry-After': '30' },
            })
        );

        await expect(upstream.post('/api/v1/auth/login', {}, { anonymous: true })).rejects.toMatchObject({
            status: 429,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: 30,
        });
    });

    it('sends public catalogue calls without an Authorization header and never refreshes them', async () => {
        jar.set('access_token', 'stale');
        jar.set('refresh_token', 'ref');
        fetchMock.mockResolvedValueOnce(jsonResponse(200, { content: [] }));

        await upstream.get('/api/v1/cars', { anonymous: true });

        expect(lastHeaders().Authorization).toBeUndefined();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(jar.get('refresh_token')).toBe('ref');
    });

    it('shares one refresh call between parallel requests using the same refresh token', async () => {
        jar.set('refresh_token', 'ref');
        fetchMock.mockImplementation(async (url: URL) =>
            url.pathname === '/api/v1/auth/refresh' ? jsonResponse(200, refreshed) : jsonResponse(200, {})
        );

        await Promise.all([upstream.get('/api/v1/a'), upstream.get('/api/v1/b'), upstream.get('/api/v1/c')]);

        const refreshCalls = fetchMock.mock.calls.filter(([url]) => (url as URL).pathname === '/api/v1/auth/refresh');
        expect(refreshCalls).toHaveLength(1);
    });

    it('does not reuse a refresh result for a different refresh token', async () => {
        fetchMock.mockResolvedValue(jsonResponse(200, refreshed));

        await refreshAuthTokens('one');
        await refreshAuthTokens('two');

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('does not cache transient refresh failures', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(503, {})).mockResolvedValueOnce(jsonResponse(200, refreshed));

        expect(await refreshAuthTokens('ref')).toBeNull();
        expect(await refreshAuthTokens('ref')).toMatchObject({ accessToken: 'fresh-access' });
    });

    it('attaches an abort signal to upstream calls', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));

        await upstream.get('/api/v1/cars');

        expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    });

    it('maps an upstream timeout to 504', async () => {
        fetchMock.mockRejectedValueOnce(new DOMException('timed out', 'TimeoutError'));

        await expect(upstream.get('/api/v1/cars')).rejects.toMatchObject({ status: 504 });
    });

    it('treats a refresh timeout as a failed refresh', async () => {
        fetchMock.mockRejectedValueOnce(new DOMException('timed out', 'TimeoutError'));

        expect(await refreshAuthTokens('slow')).toBeNull();
    });

    it('rejects a malformed refresh response instead of storing it', async () => {
        jar.set('access_token', 'stale');
        jar.set('refresh_token', 'ref');
        fetchMock
            .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
            .mockResolvedValueOnce(jsonResponse(200, { accessToken: 5 }));

        await expect(upstream.get('/api/v1/rentals/me')).rejects.toMatchObject({ status: 401 });

        expect(jar.get('access_token')).toBe('stale');
    });

    it('sends FormData without a JSON content type', async () => {
        jar.set('access_token', 'tok');
        fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));
        const form = new FormData();
        form.append('file', new Blob(['x']), 'x.png');

        await upstream.post('/api/v1/users/me/avatar', form);

        expect(lastHeaders()['Content-Type']).toBeUndefined();
        expect(fetchMock.mock.calls[0][1].body).toBe(form);
    });

    it('forgetRefresh drops the shared outcome so a rotated token is not replayed after logout', async () => {
        fetchMock.mockResolvedValue(jsonResponse(200, refreshed));

        await refreshAuthSession('logout-token');
        forgetRefresh('logout-token');
        await refreshAuthSession('logout-token');

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('sends no client IP when no proxy hops are trusted', async () => {
        incomingHeaders = { 'x-forwarded-for': '198.51.100.7', 'x-client-ip': '6.6.6.6' };
        fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));

        await upstream.get('/api/v1/cars', { anonymous: true });

        expect(lastHeaders()['X-Client-IP']).toBeUndefined();
    });

    it('forwards the right-most trusted hop as X-Client-IP', async () => {
        process.env.TRUSTED_PROXY_HOPS = '1';
        resetServerEnvForTests();
        incomingHeaders = { 'x-forwarded-for': '6.6.6.6, 198.51.100.7' };
        fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));

        await upstream.get('/api/v1/cars', { anonymous: true });

        expect(lastHeaders()['X-Client-IP']).toBe('198.51.100.7');
    });

    it('never forwards a client-supplied X-Client-IP, even through caller headers', async () => {
        process.env.TRUSTED_PROXY_HOPS = '1';
        resetServerEnvForTests();
        incomingHeaders = { 'x-forwarded-for': '198.51.100.7', 'x-client-ip': '6.6.6.6' };
        fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));

        await upstream.get('/api/v1/cars', { anonymous: true, headers: { 'X-Client-IP': '6.6.6.6' } });

        expect(lastHeaders()['X-Client-IP']).toBe('198.51.100.7');
    });

    it('sends X-Client-IP on refresh calls', async () => {
        process.env.TRUSTED_PROXY_HOPS = '1';
        resetServerEnvForTests();
        incomingHeaders = { 'x-forwarded-for': '198.51.100.7' };
        fetchMock.mockResolvedValueOnce(jsonResponse(200, refreshed));

        await refreshAuthSession('ref-ip');

        expect(lastHeaders()['X-Client-IP']).toBe('198.51.100.7');
    });

    it('prefers an explicit client IP for refresh calls made outside a request scope', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(200, refreshed));

        await refreshAuthSession('ref-explicit', '192.0.2.5');

        expect(lastHeaders()['X-Client-IP']).toBe('192.0.2.5');
    });

    it('returns undefined for 204 responses', async () => {
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

        expect(await upstream.delete('/api/v1/cars/1')).toBeUndefined();
    });
});
