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
import { POST as createIntent } from '../rentals/[id]/payment-intent/route';
import { GET as getPayment } from '../rentals/[id]/payment/route';

const fetchMock = vi.fn();

const intentBody = {
    paymentId: 7,
    rentalId: 42,
    paymentIntentId: 'pi_123',
    clientSecret: 'pi_123_secret_abc',
    publishableKey: 'pk_test_abc',
    status: 'PENDING',
    amount: 300.5,
    currency: 'USD',
};

const paymentBody = {
    paymentId: 7,
    rentalId: 42,
    status: 'AUTHORIZED',
    amount: 300.5,
    currency: 'USD',
    refundedAmount: null,
    failureReason: null,
};

function ctx(id: string) {
    return { params: Promise.resolve({ id }) };
}

function intentRequest(headers: Record<string, string> = {}, body?: unknown): NextRequest {
    return new NextRequest('http://localhost:3000/api/rentals/42/payment-intent?amount=1', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

function paymentRequest(): NextRequest {
    return new NextRequest('http://localhost:3000/api/rentals/42/payment');
}

function upstreamJson(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('payment BFF contract', () => {
    beforeEach(() => {
        jar.clear();
        jar.set('access_token', 'a1');
        fetchMock.mockReset();
        global.fetch = fetchMock as unknown as typeof fetch;
        resetServerEnvForTests();
        resetRefreshCacheForTests();
    });

    describe('POST /api/rentals/{id}/payment-intent', () => {
        it('forwards the bearer token and returns the validated intent', async () => {
            fetchMock.mockResolvedValueOnce(upstreamJson(200, intentBody));

            const response = await createIntent(intentRequest(), ctx('42'));

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual(intentBody);
            const [url, init] = fetchMock.mock.calls[0];
            expect((url as URL).pathname).toBe('/api/rentals/42/payment-intent');
            expect(init.method).toBe('POST');
            expect(init.headers.Authorization).toBe('Bearer a1');
        });

        it('never forwards a client-sent amount, body or query', async () => {
            fetchMock.mockResolvedValueOnce(upstreamJson(200, intentBody));

            await createIntent(intentRequest({}, { amount: 1, currency: 'USD' }), ctx('42'));

            const [url, init] = fetchMock.mock.calls[0];
            expect(init.body).toBeUndefined();
            expect((url as URL).search).toBe('');
        });

        it('accepts a null publishable key', async () => {
            fetchMock.mockResolvedValueOnce(upstreamJson(200, { ...intentBody, publishableKey: null }));

            const response = await createIntent(intentRequest(), ctx('42'));

            expect(response.status).toBe(200);
            expect((await response.json()).publishableKey).toBeNull();
        });

        it('rejects a cross-origin request without calling the API', async () => {
            const response = await createIntent(intentRequest({ origin: 'http://evil.example' }), ctx('42'));

            expect(response.status).toBe(403);
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('rejects a non-JSON content type without calling the API', async () => {
            const response = await createIntent(intentRequest({ 'content-type': 'text/plain' }), ctx('42'));

            expect(response.status).toBe(415);
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('rejects an invalid rental id', async () => {
            const response = await createIntent(intentRequest(), ctx('abc'));

            expect(response.status).toBe(400);
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('answers 502 when the API returns a live-mode publishable key', async () => {
            fetchMock.mockResolvedValueOnce(upstreamJson(200, { ...intentBody, publishableKey: 'pk_live_abc' }));

            const response = await createIntent(intentRequest(), ctx('42'));

            expect(response.status).toBe(502);
        });

        it('answers 502 when the API shape is wrong', async () => {
            fetchMock.mockResolvedValueOnce(upstreamJson(200, { ...intentBody, clientSecret: undefined }));
            expect((await createIntent(intentRequest(), ctx('42'))).status).toBe(502);

            fetchMock.mockResolvedValueOnce(upstreamJson(200, { ...intentBody, status: 'WEIRD' }));
            expect((await createIntent(intentRequest(), ctx('42'))).status).toBe(502);
        });

        it.each([
            [403, 'ACCESS_DENIED'],
            [400, 'INVALID_RENTAL_STATE'],
            [404, 'RENTAL_NOT_FOUND'],
            [409, 'INVALID_PAYMENT_STATE'],
        ])('passes a %i %s error through with its code', async (status, code) => {
            fetchMock.mockResolvedValueOnce(upstreamJson(status, { errorCode: code, message: 'nope' }));

            const response = await createIntent(intentRequest(), ctx('42'));

            expect(response.status).toBe(status);
            expect((await response.json()).code).toBe(code);
        });

        it('renews an expired access token and retries', async () => {
            jar.delete('access_token');
            jar.set('refresh_token', 'r1');
            fetchMock
                .mockResolvedValueOnce(upstreamJson(200, { accessToken: 'a2', refreshToken: 'r2', expiresIn: 900 }))
                .mockResolvedValueOnce(upstreamJson(200, intentBody));

            const response = await createIntent(intentRequest(), ctx('42'));

            expect(response.status).toBe(200);
            expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer a2');
            expect(jar.get('refresh_token')).toBe('r2');
        });

        it('passes a 401 through when there is no session', async () => {
            jar.clear();
            fetchMock.mockResolvedValueOnce(upstreamJson(401, { errorCode: 'AUTHENTICATION_FAILED', message: 'no' }));

            const response = await createIntent(intentRequest(), ctx('42'));

            expect(response.status).toBe(401);
        });

        it('answers 503 when the API is unreachable', async () => {
            fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));

            const response = await createIntent(intentRequest(), ctx('42'));

            expect(response.status).toBe(503);
        });
    });

    describe('GET /api/rentals/{id}/payment', () => {
        it('returns the validated payment summary', async () => {
            fetchMock.mockResolvedValueOnce(upstreamJson(200, paymentBody));

            const response = await getPayment(paymentRequest(), ctx('42'));

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual(paymentBody);
            const [url, init] = fetchMock.mock.calls[0];
            expect((url as URL).pathname).toBe('/api/rentals/42/payment');
            expect(init.method).toBe('GET');
            expect(init.headers.Authorization).toBe('Bearer a1');
        });

        it('keeps refunded amounts and failure reasons', async () => {
            const body = { ...paymentBody, status: 'REFUNDED', refundedAmount: 120.25, failureReason: 'x' };
            fetchMock.mockResolvedValueOnce(upstreamJson(200, body));

            const response = await getPayment(paymentRequest(), ctx('42'));

            expect(await response.json()).toEqual(body);
        });

        it('answers 502 on an unknown status', async () => {
            fetchMock.mockResolvedValueOnce(upstreamJson(200, { ...paymentBody, status: 'Authorized' }));

            const response = await getPayment(paymentRequest(), ctx('42'));

            expect(response.status).toBe(502);
        });

        it.each([
            [403, 'ACCESS_DENIED'],
            [404, 'RENTAL_NOT_FOUND'],
        ])('passes a %i %s error through', async (status, code) => {
            fetchMock.mockResolvedValueOnce(upstreamJson(status, { errorCode: code, message: 'nope' }));

            const response = await getPayment(paymentRequest(), ctx('42'));

            expect(response.status).toBe(status);
            expect((await response.json()).code).toBe(code);
        });

        it('rejects an invalid rental id', async () => {
            const response = await getPayment(paymentRequest(), ctx('1x'));

            expect(response.status).toBe(400);
            expect(fetchMock).not.toHaveBeenCalled();
        });
    });
});
