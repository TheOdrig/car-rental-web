import { describe, it, expect } from 'vitest';
import { ApiError } from '@/shared/api/error';
import {
    getAdminActionErrorMessage,
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
