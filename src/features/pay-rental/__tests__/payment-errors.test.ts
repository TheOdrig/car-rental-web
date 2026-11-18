import { describe, it, expect, vi } from 'vitest';
import { ApiError } from '@/shared/api/error';
import { describePaymentError, PAYMENT_WINDOW_ERROR_CODES } from '../lib/payment-errors';
import { isTestPublishableKey, resolvePublishableKey } from '../lib/stripe-client';

describe('describePaymentError', () => {
    it.each([
        [401, 'signin'],
        [403, 'forbidden'],
        [400, 'not-confirmed'],
        [404, 'not-found'],
        [409, 'settled'],
        [500, 'unavailable'],
        [503, 'unavailable'],
    ])('maps %i to %s', (status, kind) => {
        expect(describePaymentError(new ApiError(status, 'x')).kind).toBe(kind);
    });

    it('treats a non-API error as unavailable', () => {
        expect(describePaymentError(new TypeError('boom')).kind).toBe('unavailable');
        expect(describePaymentError(undefined).kind).toBe('unavailable');
    });

    describe('payment window codes', () => {
        it('maps a registered code to the window-not-open state regardless of status', () => {
            const error = new ApiError({
                status: 409,
                message: 'too early',
                timestamp: new Date().toISOString(),
                code: 'PAYMENT_WINDOW_NOT_OPEN',
            });

            expect(PAYMENT_WINDOW_ERROR_CODES).toContain('PAYMENT_WINDOW_NOT_OPEN');
            expect(describePaymentError(error).kind).toBe('window-not-open');
        });

        it('shows the date the payment opens on', () => {
            const error = new ApiError({
                status: 409,
                message: 'too early',
                timestamp: new Date().toISOString(),
                code: 'PAYMENT_WINDOW_NOT_OPEN',
                details: { paymentOpensOn: '2026-12-01' },
            });

            expect(describePaymentError(error).message).toBe('Payment opens on December 1, 2026.');
        });

        it('falls back to the generic message without a usable date', () => {
            const error = new ApiError({
                status: 409,
                message: 'too early',
                timestamp: new Date().toISOString(),
                code: 'PAYMENT_WINDOW_NOT_OPEN',
                details: { paymentOpensOn: 'soon' },
            });

            expect(describePaymentError(error).message).toContain('closer to the start date');
        });

        it('ignores unregistered codes', () => {
            const error = new ApiError({
                status: 409,
                message: 'x',
                timestamp: new Date().toISOString(),
                code: 'SOMETHING_ELSE',
            });

            expect(describePaymentError(error).kind).toBe('settled');
        });
    });
});

describe('publishable key resolution', () => {
    it('accepts only test keys', () => {
        expect(isTestPublishableKey('pk_test_abc')).toBe(true);
        expect(isTestPublishableKey('pk_live_abc')).toBe(false);
        expect(isTestPublishableKey(null)).toBe(false);
        expect(isTestPublishableKey(undefined)).toBe(false);
    });

    it('prefers the API key and falls back to the server key', () => {
        expect(resolvePublishableKey('pk_test_api', 'pk_test_env')).toBe('pk_test_api');
        expect(resolvePublishableKey(null, 'pk_test_env')).toBe('pk_test_env');
        expect(resolvePublishableKey(undefined, undefined)).toBeNull();
    });

    it('never resolves a live key', () => {
        expect(resolvePublishableKey('pk_live_api', 'pk_test_env')).toBeNull();
        expect(resolvePublishableKey(null, 'pk_live_env')).toBeNull();
    });
});

vi.mock('@stripe/stripe-js', () => ({ loadStripe: vi.fn() }));
