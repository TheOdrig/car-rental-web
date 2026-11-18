import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next/headers', () => ({
    cookies: vi.fn(async () => ({
        get: () => undefined,
        set: vi.fn(),
        delete: vi.fn(),
    })),
}));

import { ApiError } from '@/shared/api/error';
import { parseIdParam, proxy, route } from '../route';

const request = (url = 'http://localhost:3000/api/x', init?: ConstructorParameters<typeof NextRequest>[1]) =>
    new NextRequest(url, init);
const context = <P extends Record<string, string>>(params: P) => ({ params: Promise.resolve(params) });

describe('parseIdParam', () => {
    it('accepts positive integers and rejects everything else', () => {
        expect(parseIdParam('42', 'car ID')).toBe(42);
        expect(() => parseIdParam('4x', 'car ID')).toThrow(ApiError);
        expect(() => parseIdParam('-1', 'car ID')).toThrow('Invalid car ID');
        expect(() => parseIdParam('1.5', 'car ID')).toThrow(ApiError);
        expect(() => parseIdParam(undefined, 'car ID')).toThrow(ApiError);
    });
});

describe('route request guards', () => {
    const ok = route(async () => ({ ok: true }), { errorMessage: 'failed' });
    const json = { 'content-type': 'application/json' };

    it('rejects state-changing requests without a JSON content type', async () => {
        for (const method of ['POST', 'PUT', 'PATCH']) {
            const response = await ok(request(undefined, { method, headers: { 'content-type': 'text/plain' }, body: 'x' }), context({}));
            expect(response.status).toBe(415);
        }

        const missing = await ok(request(undefined, { method: 'POST' }), context({}));
        expect(missing.status).toBe(415);
    });

    it('accepts JSON with a charset parameter', async () => {
        const response = await ok(
            request(undefined, { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: '{}' }),
            context({})
        );

        expect(response.status).toBe(200);
    });

    it('lets GET and bodyless DELETE through without a content type', async () => {
        expect((await ok(request(), context({}))).status).toBe(200);
        expect((await ok(request(undefined, { method: 'DELETE' }), context({}))).status).toBe(200);
    });

    it('accepts multipart only on routes that declare it', async () => {
        const upload = route(async () => ({ ok: true }), { errorMessage: 'failed', contentTypes: ['multipart/form-data'] });
        const headers = { 'content-type': 'multipart/form-data; boundary=x' };

        expect((await upload(request(undefined, { method: 'POST', headers, body: 'x' }), context({}))).status).toBe(200);
        expect((await ok(request(undefined, { method: 'POST', headers, body: 'x' }), context({}))).status).toBe(415);
        expect((await upload(request(undefined, { method: 'POST', headers: json, body: '{}' }), context({}))).status).toBe(415);
    });

    it('rejects a cross-origin Origin header on state-changing requests', async () => {
        const response = await ok(
            request(undefined, { method: 'POST', headers: { ...json, origin: 'https://evil.example' }, body: '{}' }),
            context({})
        );

        expect(response.status).toBe(403);
    });

    it('accepts a same-origin Origin header and a request without one', async () => {
        const same = await ok(
            request(undefined, { method: 'POST', headers: { ...json, origin: 'http://localhost:3000' }, body: '{}' }),
            context({})
        );
        const none = await ok(request(undefined, { method: 'POST', headers: json, body: '{}' }), context({}));

        expect(same.status).toBe(200);
        expect(none.status).toBe(200);
    });

    it('compares Origin with the forwarded host behind a proxy', async () => {
        const response = await ok(
            request(undefined, {
                method: 'POST',
                headers: { ...json, origin: 'https://app.example.com', 'x-forwarded-host': 'app.example.com' },
                body: '{}',
            }),
            context({})
        );

        expect(response.status).toBe(200);
    });

    it('ignores Origin on safe methods', async () => {
        const response = await ok(request(undefined, { headers: { origin: 'https://evil.example' } }), context({}));

        expect(response.status).toBe(200);
    });
});

describe('route', () => {
    it('serialises the handler result', async () => {
        const handler = route(async () => ({ ok: true }), { errorMessage: 'failed' });
        const response = await handler(request(), context({}));

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ ok: true });
    });

    it('maps ApiError to its status with message and field errors', async () => {
        const handler = route(
            async () => {
                throw new ApiError({ status: 422, message: 'bad', errors: { a: 'x' }, timestamp: 't' });
            },
            { errorMessage: 'failed' }
        );
        const response = await handler(request(), context({}));

        expect(response.status).toBe(422);
        expect(await response.json()).toEqual({ message: 'bad', error: 'bad', errors: { a: 'x' } });
    });

    it('hides unexpected error details behind the fallback message', async () => {
        const handler = route(
            async () => {
                throw new Error('db password leaked');
            },
            { errorMessage: 'Failed to do it', errorStatus: 500 }
        );
        const response = await handler(request(), context({}));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.message).toBe('Failed to do it');
        expect(JSON.stringify(body)).not.toContain('leaked');
    });

    it('maps network failures to 503', async () => {
        const handler = route(
            async () => {
                throw new TypeError('fetch failed');
            },
            { errorMessage: 'failed' }
        );

        expect((await handler(request(), context({}))).status).toBe(503);
    });
});

describe('proxy', () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        fetchMock.mockReset();
        global.fetch = fetchMock as unknown as typeof fetch;
    });

    it('validates path ids before calling the upstream', async () => {
        const handler = proxy<{ id: string }>({
            path: ({ id }) => `/api/cars/${parseIdParam(id, 'car ID')}`,
            errorMessage: 'failed',
        });
        const response = await handler(request(), context({ id: 'abc' }));

        expect(response.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('forwards the query string and json body', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(JSON.stringify({ id: 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } })
        );
        const handler = proxy({
            path: () => '/api/things',
            method: 'POST',
            forwardQuery: true,
            status: 201,
            errorMessage: 'failed',
        });
        const response = await handler(
            request('http://localhost:3000/api/things?page=2&page=3', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ name: 'n' }),
            }),
            context({})
        );

        expect(response.status).toBe(201);
        const [url, init] = fetchMock.mock.calls[0];
        expect(String(url)).toBe('http://localhost:8082/api/things?page=2&page=3');
        expect(init.body).toBe(JSON.stringify({ name: 'n' }));
    });

    it('rejects an invalid json body with 400', async () => {
        const handler = proxy({ path: () => '/api/things', method: 'POST', errorMessage: 'failed' });
        const response = await handler(request('http://localhost:3000/api/things', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' }), context({}));

        expect(response.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns an empty object for 204 upstream responses', async () => {
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
        const handler = proxy({ path: () => '/api/things/1', method: 'DELETE', errorMessage: 'failed' });
        const response = await handler(request(), context({}));

        expect(await response.json()).toEqual({});
    });
});
