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
import { resetRefreshCacheForTests } from '@/shared/server/upstream';
import { POST as cancelRental } from '../rentals/[id]/cancel/route';

const fetchMock = vi.fn();

function ctx(id: string) {
    return { params: Promise.resolve({ id }) };
}

function cancelRequest(body?: unknown): NextRequest {
    return new NextRequest('http://localhost:3000/api/rentals/5/cancel', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('rental cancel BFF route', () => {
    beforeEach(() => {
        jar.clear();
        jar.set('access_token', 'a1');
        fetchMock.mockReset();
        global.fetch = fetchMock as unknown as typeof fetch;
        resetServerEnvForTests();
        resetRefreshCacheForTests();
    });

    it('posts the cancel with the reason to the upstream', async () => {
        fetchMock.mockResolvedValueOnce(json({ id: 5, status: 'CANCELLED', cancelledBy: 'ADMIN' }));

        const response = await cancelRental(cancelRequest({ reason: 'Car in the workshop' }), ctx('5'));

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ cancelledBy: 'ADMIN' });
        const [url, init] = fetchMock.mock.calls[0];
        expect(String(url)).toBe('http://localhost:8082/api/v1/rentals/5/cancel');
        expect(init.method).toBe('POST');
        expect(JSON.parse(init.body)).toEqual({ reason: 'Car in the workshop' });
    });

    it('cancels without a body when the caller gives no reason', async () => {
        fetchMock.mockResolvedValueOnce(json({ id: 5, status: 'CANCELLED' }));

        const response = await cancelRental(cancelRequest(), ctx('5'));

        expect(response.status).toBe(200);
        expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
    });

    it('hands the upstream field error for a too long reason to the caller', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    status: 400,
                    code: 'VALIDATION_FAILED',
                    detail: 'Validation failed',
                    errors: [{ field: 'reason', message: 'size must be between 0 and 500' }],
                }),
                { status: 400, headers: { 'Content-Type': 'application/problem+json' } }
            )
        );

        const response = await cancelRental(cancelRequest({ reason: 'x'.repeat(501) }), ctx('5'));

        expect(response.status).toBe(400);
        expect((await response.json()).errors).toEqual([{ field: 'reason', message: 'size must be between 0 and 500' }]);
    });

    it('rejects a malformed rental id before calling the upstream', async () => {
        const response = await cancelRental(cancelRequest(), ctx('5; drop'));

        expect(response.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
