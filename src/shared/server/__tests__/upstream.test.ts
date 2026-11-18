import { describe, it, expect, vi, beforeEach } from 'vitest';

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

import { ApiError } from '@/shared/api/error';
import { resetServerEnvForTests } from '../env';
import { buildUpstreamUrl, upstream } from '../upstream';

function jsonResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

const refreshed = { accessToken: 'fresh-access', refreshToken: 'fresh-refresh', expiresIn: 900 };

describe('upstream', () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        jar.clear();
        fetchMock.mockReset();
        global.fetch = fetchMock as unknown as typeof fetch;
        resetServerEnvForTests();
    });

    function lastHeaders(call = 0): Record<string, string> {
        return fetchMock.mock.calls[call][1].headers as Record<string, string>;
    }

    it('resolves paths against the server-side API_URL and forwards params', () => {
        const url = buildUpstreamUrl('/api/cars', new URLSearchParams('a=1&a=2'));

        expect(url.toString()).toBe('http://localhost:8082/api/cars?a=1&a=2');
    });

    it('sends the access token from the cookie as a bearer header', async () => {
        jar.set('access_token', 'tok');
        fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

        await upstream.get('/api/cars');

        expect(lastHeaders().Authorization).toBe('Bearer tok');
    });

    it('does not attach credentials or refresh for anonymous calls', async () => {
        jar.set('access_token', 'tok');
        jar.set('refresh_token', 'ref');
        fetchMock.mockResolvedValueOnce(jsonResponse(401, { message: 'bad credentials' }));

        await expect(upstream.post('/api/auth/login', { u: 1 }, { anonymous: true })).rejects.toMatchObject({
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

        const result = await upstream.get('/api/rentals/me');

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

        await expect(upstream.get('/api/admin/users')).rejects.toMatchObject({ status: 403 });

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('refreshes before the request when only a refresh token exists', async () => {
        jar.set('refresh_token', 'ref');
        fetchMock.mockResolvedValueOnce(jsonResponse(200, refreshed)).mockResolvedValueOnce(jsonResponse(200, {}));

        await upstream.get('/api/rentals/me');

        expect(lastHeaders(1).Authorization).toBe('Bearer fresh-access');
    });

    it('clears the session when the refresh token is rejected', async () => {
        jar.set('access_token', 'stale');
        jar.set('refresh_token', 'ref');
        fetchMock
            .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
            .mockResolvedValueOnce(jsonResponse(401, { message: 'invalid refresh' }));

        await expect(upstream.get('/api/rentals/me')).rejects.toBeInstanceOf(ApiError);

        expect(jar.has('access_token')).toBe(false);
        expect(jar.has('refresh_token')).toBe(false);
    });

    it('rejects a malformed refresh response instead of storing it', async () => {
        jar.set('access_token', 'stale');
        jar.set('refresh_token', 'ref');
        fetchMock
            .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
            .mockResolvedValueOnce(jsonResponse(200, { accessToken: 5 }));

        await expect(upstream.get('/api/rentals/me')).rejects.toMatchObject({ status: 401 });

        expect(jar.has('refresh_token')).toBe(false);
    });

    it('sends FormData without a JSON content type', async () => {
        jar.set('access_token', 'tok');
        fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));
        const form = new FormData();
        form.append('file', new Blob(['x']), 'x.png');

        await upstream.post('/api/users/me/avatar', form);

        expect(lastHeaders()['Content-Type']).toBeUndefined();
        expect(fetchMock.mock.calls[0][1].body).toBe(form);
    });

    it('returns undefined for 204 responses', async () => {
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

        expect(await upstream.delete('/api/cars/1')).toBeUndefined();
    });
});
