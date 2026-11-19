import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    ApiError,
    apiClient,
    detailString,
    fieldErrorMap,
    fieldErrorMessages,
    getFormErrorMessage,
    parseErrorResponse,
    rateLimitMessage,
} from '@/shared/api';

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...headers },
    });
}

describe('parseErrorResponse', () => {
    it('reads the error code and Retry-After of a rate limit response', async () => {
        const parsed = await parseErrorResponse(
            json(429, { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' }, { 'Retry-After': '30' })
        );

        expect(parsed).toMatchObject({ status: 429, code: 'RATE_LIMIT_EXCEEDED', retryAfter: 30 });
    });

    it('reads the BFF code field and ignores a malformed Retry-After', async () => {
        const parsed = await parseErrorResponse(
            json(409, { code: 'CAR_NOT_AVAILABLE', message: 'booked' }, { 'Retry-After': 'soon' })
        );

        expect(parsed.code).toBe('CAR_NOT_AVAILABLE');
        expect(parsed.retryAfter).toBeUndefined();
    });

    it('reads an RFC 9457 problem body', async () => {
        const parsed = await parseErrorResponse(
            json(409, {
                type: 'urn:car-rental:problem:payment-window-not-open',
                title: 'Conflict',
                status: 409,
                detail: 'Payment is not open yet',
                instance: '/api/v1/rentals/4/payment-intent',
                code: 'PAYMENT_WINDOW_NOT_OPEN',
                timestamp: '2026-11-18T10:00:00Z',
                traceId: 'trace-1',
                details: { paymentOpensOn: '2026-12-01' },
                errors: [
                    { field: 'startDate', message: 'must not be null' },
                    { field: 'startDate', message: 'must be a date' },
                    { nope: true },
                ],
            })
        );

        expect(parsed).toMatchObject({
            status: 409,
            message: 'Payment is not open yet',
            title: 'Conflict',
            instance: '/api/v1/rentals/4/payment-intent',
            code: 'PAYMENT_WINDOW_NOT_OPEN',
            traceId: 'trace-1',
            timestamp: '2026-11-18T10:00:00Z',
            details: { paymentOpensOn: '2026-12-01' },
            errors: [
                { field: 'startDate', message: 'must not be null' },
                { field: 'startDate', message: 'must be a date' },
            ],
        });
    });

    it('maps field errors to a field map and details to strings', () => {
        const error = new ApiError({
            status: 400,
            message: 'Validation failed',
            timestamp: '',
            details: { paymentOpensOn: '2026-12-01', count: 3 },
            errors: [
                { field: 'email', message: 'is invalid' },
                { field: 'email', message: 'is required' },
                { field: 'name', message: 'too short' },
            ],
        });

        expect(fieldErrorMap(error)).toEqual({ email: 'is invalid is required', name: 'too short' });
        expect(fieldErrorMessages(error, 'email')).toEqual(['is invalid', 'is required']);
        expect(detailString(error, 'paymentOpensOn')).toBe('2026-12-01');
        expect(detailString(error, 'count')).toBeUndefined();
        expect(fieldErrorMap(new Error('x'))).toEqual({});
    });

    it('keeps Retry-After when the body is not JSON', async () => {
        const parsed = await parseErrorResponse(
            new Response('slow down', { status: 429, headers: { 'Retry-After': '9' } })
        );

        expect(parsed.retryAfter).toBe(9);
    });
});

describe('rate limit messages', () => {
    it('formats seconds, minutes and the missing header', () => {
        expect(rateLimitMessage(1)).toBe('Too many attempts. Please try again in 1 second.');
        expect(rateLimitMessage(30)).toBe('Too many attempts. Please try again in 30 seconds.');
        expect(rateLimitMessage(61)).toBe('Too many attempts. Please try again in 2 minutes.');
        expect(rateLimitMessage(60)).toBe('Too many attempts. Please try again in 1 minute.');
        expect(rateLimitMessage()).toBe('Too many attempts. Please wait a moment and try again.');
    });

    it('uses the fallback for anything that is not a 429', () => {
        expect(getFormErrorMessage(new ApiError(401, 'nope'), 'Invalid credentials')).toBe('Invalid credentials');
        expect(getFormErrorMessage(new Error('x'), 'Fallback')).toBe('Fallback');
        const limited = new ApiError({ status: 429, message: 'x', timestamp: '', retryAfter: 5 });
        expect(getFormErrorMessage(limited, 'Fallback')).toContain('5 seconds');
    });
});

describe('clientFetch refresh handling', () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        fetchMock.mockReset();
        global.fetch = fetchMock as unknown as typeof fetch;
    });

    it('does not try to refresh after a 403', async () => {
        fetchMock.mockResolvedValueOnce(json(403, { code: 'ACCESS_DENIED', message: 'Forbidden' }));

        await expect(apiClient.get('/api/admin/users')).rejects.toMatchObject({ status: 403, code: 'ACCESS_DENIED' });

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('refreshes once after a 401 and retries the original request', async () => {
        fetchMock
            .mockResolvedValueOnce(json(401, { code: 'AUTHENTICATION_FAILED', message: 'Authentication is required' }))
            .mockResolvedValueOnce(json(200, {}))
            .mockResolvedValueOnce(json(200, { ok: true }));

        await expect(apiClient.get('/api/rentals/me')).resolves.toEqual({ ok: true });

        expect(fetchMock.mock.calls.map(([url]) => new URL(url as string, 'http://localhost').pathname)).toEqual([
            '/api/rentals/me',
            '/api/auth/refresh',
            '/api/rentals/me',
        ]);
    });

    it('surfaces the original 401 when the refresh is refused', async () => {
        fetchMock
            .mockResolvedValueOnce(json(401, { message: 'expired' }))
            .mockResolvedValueOnce(json(401, { message: 'Token refresh failed' }));

        await expect(apiClient.get('/api/rentals/me')).rejects.toMatchObject({ status: 401 });

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('does not refresh after a 429 and exposes Retry-After', async () => {
        fetchMock.mockResolvedValueOnce(
            json(429, { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many' }, { 'Retry-After': '12' })
        );

        await expect(apiClient.post('/api/auth/login', {})).rejects.toMatchObject({ status: 429, retryAfter: 12 });

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});

describe('getFormErrorMessage for duplicate accounts', () => {
    it('maps a 409 USER_ALREADY_EXISTS without echoing the address', () => {
        const conflict = new ApiError({
            status: 409,
            message: 'User already exists with email: a@b.co',
            timestamp: '',
            code: 'USER_ALREADY_EXISTS',
        });

        const message = getFormErrorMessage(conflict, 'Registration failed');
        expect(message).toMatch(/already exists/i);
        expect(message).not.toContain('a@b.co');
    });

    it('keeps the fallback for other 409 conflicts', () => {
        const other = new ApiError({ status: 409, message: 'x', timestamp: '', code: 'DATA_CONFLICT' });
        expect(getFormErrorMessage(other, 'Registration failed')).toBe('Registration failed');
    });
});
