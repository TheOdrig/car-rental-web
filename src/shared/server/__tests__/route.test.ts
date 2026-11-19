import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next/headers', () => ({
    cookies: vi.fn(async () => ({
        get: () => undefined,
        set: vi.fn(),
        delete: vi.fn(),
    })),
}));

import { ApiError } from '@/shared/api/error';
import { resetServerEnvForTests } from '../env';
import { MAX_BODY_BYTES, parseIdParam, proxy, route } from '../route';

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

    it('answers a body over the limit with 413 problem+json', async () => {
        const response = await ok(
            request(undefined, {
                method: 'POST',
                headers: { 'content-type': 'application/json', 'content-length': String(MAX_BODY_BYTES + 1) },
                body: '{}',
            }),
            context({})
        );

        expect(response.status).toBe(413);
        expect(response.headers.get('content-type')).toContain('application/problem+json');
        expect(await response.json()).toMatchObject({ status: 413, code: 'PAYLOAD_TOO_LARGE' });
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

    describe('forwarded host', () => {
        const forwarded = {
            ...json,
            origin: 'https://app.example.com',
            'x-forwarded-host': 'app.example.com',
        };

        afterEach(() => {
            delete process.env.TRUSTED_PROXY_HOPS;
            resetServerEnvForTests();
        });

        it('compares Origin with the forwarded host when a trusted proxy is configured', async () => {
            process.env.TRUSTED_PROXY_HOPS = '1';
            resetServerEnvForTests();

            const response = await ok(request(undefined, { method: 'POST', headers: forwarded, body: '{}' }), context({}));

            expect(response.status).toBe(200);
        });

        it('ignores the forwarded host when no trusted proxy is configured', async () => {
            const response = await ok(request(undefined, { method: 'POST', headers: forwarded, body: '{}' }), context({}));

            expect(response.status).toBe(403);
        });
    });

    it('rejects a state-changing request without Origin when the browser says it is cross-site', async () => {
        for (const site of ['cross-site', 'same-site']) {
            const response = await ok(
                request(undefined, { method: 'POST', headers: { ...json, 'sec-fetch-site': site }, body: '{}' }),
                context({})
            );

            expect(response.status).toBe(403);
        }
    });

    it('accepts a request without Origin when Sec-Fetch-Site says same-origin or none', async () => {
        for (const site of ['same-origin', 'none']) {
            const response = await ok(
                request(undefined, { method: 'POST', headers: { ...json, 'sec-fetch-site': site }, body: '{}' }),
                context({})
            );

            expect(response.status).toBe(200);
        }
    });

    it('ignores Sec-Fetch-Site on safe methods', async () => {
        const response = await ok(request(undefined, { headers: { 'sec-fetch-site': 'cross-site' } }), context({}));

        expect(response.status).toBe(200);
    });

    it('ignores Origin on safe methods', async () => {
        const response = await ok(request(undefined, { headers: { origin: 'https://evil.example' } }), context({}));

        expect(response.status).toBe(200);
    });
});

describe('route', () => {
    const ok = route(async () => ({ ok: true }), { errorMessage: 'failed' });

    it('marks every response as uncacheable', async () => {
        const success = await ok(request(), context({}));
        const failure = await route(async () => { throw new ApiError(404, 'gone'); }, { errorMessage: 'failed' })(request(), context({}));

        expect(success.headers.get('cache-control')).toBe('private, no-store');
        expect(failure.headers.get('cache-control')).toBe('private, no-store');
    });

    it('gives every generated problem a type, title and code', async () => {
        const bad = await route(async () => { throw new ApiError(400, 'Invalid car ID'); }, { errorMessage: 'failed' })(request(), context({}));
        const missing = await ok(request(undefined, { method: 'POST' }), context({}));

        expect(await bad.json()).toMatchObject({ type: 'about:blank', title: 'Bad Request', code: 'BAD_REQUEST', status: 400 });
        expect(await missing.json()).toMatchObject({ type: 'about:blank', title: 'Unsupported Media Type', code: 'UNSUPPORTED_MEDIA_TYPE' });
    });

    it('serialises the handler result', async () => {
        const handler = route(async () => ({ ok: true }), { errorMessage: 'failed' });
        const response = await handler(request(), context({}));

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ ok: true });
    });

    it('maps ApiError to its status with message and field errors', async () => {
        const handler = route(
            async () => {
                throw new ApiError({ status: 422, message: 'bad', errors: [{ field: 'a', message: 'x' }], timestamp: 't', code: 'VALIDATION_FAILED' });
            },
            { errorMessage: 'failed' }
        );
        const response = await handler(request(), context({}));

        expect(response.status).toBe(422);
        expect(response.headers.get('content-type')).toContain('application/problem+json');
        expect(await response.json()).toMatchObject({
            status: 422,
            detail: 'bad',
            code: 'VALIDATION_FAILED',
            errors: [{ field: 'a', message: 'x' }],
        });
    });

    it('reports the BFF path as the problem instance, never the upstream path', async () => {
        const handler = route(
            async () => {
                throw new ApiError({
                    status: 409,
                    message: 'taken',
                    timestamp: 't',
                    instance: '/api/v1/rentals/request',
                });
            },
            { errorMessage: 'failed' }
        );
        const response = await handler(request('http://localhost:3000/api/rentals/request'), context({}));
        const body = await response.json();

        expect(body.instance).toBe('/api/rentals/request');
        expect(JSON.stringify(body)).not.toContain('/api/v1');
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
        expect(body.detail).toBe('Failed to do it');
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
            target: ({ id }) => ({ method: 'GET', path: `/api/cars/${parseIdParam(id, 'car ID')}` }),
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
            target: () => ({ method: 'POST', path: '/api/things' }),
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

    it('does not forward upstream security headers to the browser', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(JSON.stringify({ id: 1 }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Security-Policy': "default-src 'none'",
                    'Strict-Transport-Security': 'max-age=31536000',
                    'X-Frame-Options': 'DENY',
                },
            })
        );
        const handler = proxy({ target: () => ({ method: 'GET', path: '/api/things/1' }), errorMessage: 'failed' });
        const response = await handler(request(), context({}));

        expect(response.headers.get('content-type')).toContain('application/json');
        expect(response.headers.get('content-security-policy')).toBeNull();
        expect(response.headers.get('strict-transport-security')).toBeNull();
        expect(response.headers.get('x-frame-options')).toBeNull();
    });

    it('rejects an invalid json body with 400', async () => {
        const handler = proxy({ target: () => ({ method: 'POST', path: '/api/things' }), errorMessage: 'failed' });
        const response = await handler(request('http://localhost:3000/api/things', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' }), context({}));

        expect(response.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns an empty object for 204 upstream responses', async () => {
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
        const handler = proxy({ target: () => ({ method: 'DELETE', path: '/api/things/1' }), errorMessage: 'failed' });
        const response = await handler(request(), context({}));

        expect(await response.json()).toEqual({});
    });
});
