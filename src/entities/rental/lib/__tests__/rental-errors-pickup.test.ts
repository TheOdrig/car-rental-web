import { describe, it, expect } from 'vitest';
import { ApiError } from '@/shared/api/error';
import {
    getAdminActionErrorMessage,
    isAfterRentalEnd,
    isBeforeRentalStart,
    PICKUP_PAYMENT_CAPTURE_FAILED_MESSAGE,
    PICKUP_PAYMENT_REQUIRED_MESSAGE,
} from '../rental-errors';

function apiError(status: number, code: string, message: string) {
    return new ApiError({ status, message, code, timestamp: new Date().toISOString() });
}

describe('getAdminActionErrorMessage pickup payment mapping', () => {
    it('explains that pickup needs an authorized payment', () => {
        const error = apiError(409, 'PAYMENT_NOT_AUTHORIZED', 'Payment must be AUTHORIZED before pickup.');

        expect(getAdminActionErrorMessage(error)).toBe(PICKUP_PAYMENT_REQUIRED_MESSAGE);
    });

    it('explains a missing payment the same way', () => {
        const error = apiError(404, 'PAYMENT_NOT_FOUND', 'Payment not found for rental: 5');

        expect(getAdminActionErrorMessage(error)).toBe(PICKUP_PAYMENT_REQUIRED_MESSAGE);
    });

    it('explains a failed capture', () => {
        const error = apiError(402, 'PAYMENT_FAILED', 'Payment failed for transaction x. Reason: y');

        expect(getAdminActionErrorMessage(error)).toBe(PICKUP_PAYMENT_CAPTURE_FAILED_MESSAGE);
    });

    it('keeps other invalid-state messages untouched', () => {
        const error = apiError(400, 'INVALID_RENTAL_STATE', 'Invalid rental state. Current: ACTIVE, Required: CONFIRMED');

        expect(getAdminActionErrorMessage(error)).toBe('Invalid rental state. Current: ACTIVE, Required: CONFIRMED');
    });

    it('keeps an unrelated 404 untouched', () => {
        expect(getAdminActionErrorMessage(apiError(404, 'RENTAL_NOT_FOUND', 'Rental not found with id: 9'))).toBe(
            'Rental not found with id: 9'
        );
    });
});

describe('pickup after the rental end date', () => {
    it('shows the API message for a rental validation failure', () => {
        const message = 'Pickup is not possible after the rental end date 2026-11-10';

        expect(getAdminActionErrorMessage(apiError(400, 'RENTAL_VALIDATION_FAILED', message))).toBe(message);
    });

    it('detects an end date that has passed', () => {
        const now = new Date(2026, 10, 20, 0, 5);

        expect(isAfterRentalEnd('2026-11-19', now)).toBe(true);
        expect(isAfterRentalEnd('2026-11-19T10:00:00Z', now)).toBe(true);
    });

    it('allows pickup up to and including the end date', () => {
        const now = new Date(2026, 10, 19, 23, 30);

        expect(isAfterRentalEnd('2026-11-19', now)).toBe(false);
        expect(isAfterRentalEnd('2026-11-25', now)).toBe(false);
    });

    it('does not block on a missing or unparseable date', () => {
        expect(isAfterRentalEnd(undefined)).toBe(false);
        expect(isAfterRentalEnd('later')).toBe(false);
    });
});

describe('pickup before the rental start date', () => {
    it('shows the API message for a rental validation failure', () => {
        const message = 'Pickup is not possible before the rental start date 2026-12-01';
        const error = apiError(400, 'RENTAL_VALIDATION_FAILED', message);

        expect(getAdminActionErrorMessage(error)).toBe(message);
    });

    it('surfaces a retryable refund-busy failure as plain text', () => {
        const error = apiError(409, 'PAYMENT_FAILED', 'Refund is busy, retry shortly');

        expect(getAdminActionErrorMessage(error)).toBe('Refund is busy, retry shortly');
    });

    it('detects a start date that is still ahead', () => {
        const now = new Date(2026, 10, 19, 23, 30);

        expect(isBeforeRentalStart('2026-11-20', now)).toBe(true);
        expect(isBeforeRentalStart('2026-11-20T10:00:00Z', now)).toBe(true);
    });

    it('allows pickup on and after the start date', () => {
        const now = new Date(2026, 10, 20, 0, 5);

        expect(isBeforeRentalStart('2026-11-20', now)).toBe(false);
        expect(isBeforeRentalStart('2026-11-01', now)).toBe(false);
    });

    it('does not block on a missing or unparseable date', () => {
        expect(isBeforeRentalStart(undefined)).toBe(false);
        expect(isBeforeRentalStart('soon')).toBe(false);
    });
});
