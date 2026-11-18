import { describe, it, expect } from 'vitest';
import { ApiError } from '@/shared/api';
import { CAR_BOOKED_MESSAGE, getBookingErrorMessage } from '@/features/book-car';

function apiError(status: number, message: string, code?: string, retryAfter?: number): ApiError {
    return new ApiError({ status, message, timestamp: new Date().toISOString(), code, retryAfter });
}

describe('getBookingErrorMessage', () => {
    it('explains a 409 CAR_NOT_AVAILABLE booking conflict', () => {
        const error = apiError(409, 'Car with id 5 is already booked between 2026-12-01 and 2026-12-05', 'CAR_NOT_AVAILABLE');

        expect(getBookingErrorMessage(error)).toBe(CAR_BOOKED_MESSAGE);
    });

    it('keeps the API message for a 400 CAR_NOT_AVAILABLE that is not a date conflict', () => {
        const error = apiError(400, 'Car with id 5 is not available for rental. Reason: MAINTENANCE', 'CAR_NOT_AVAILABLE');

        expect(getBookingErrorMessage(error)).toBe(error.message);
    });

    it('shows the wait time on a rate limit', () => {
        expect(getBookingErrorMessage(apiError(429, 'Too many', 'RATE_LIMIT_EXCEEDED', 20))).toContain('20 seconds');
    });

    it('falls back to the error message and a default', () => {
        expect(getBookingErrorMessage(apiError(500, 'Boom'))).toBe('Boom');
        expect(getBookingErrorMessage('weird')).toBe('Failed to create booking');
    });
});

describe('getBookingErrorMessage rental rules', () => {
    it('explains the 30 day limit from VALIDATION_FAILED', () => {
        const error = new ApiError({
            status: 400,
            message: 'Validation failed',
            timestamp: new Date().toISOString(),
            code: 'VALIDATION_FAILED',
            errors: { withinMaxRentalLength: 'Rental cannot be longer than 30 days' },
        });

        expect(getBookingErrorMessage(error)).toContain('at most 30 days');
    });

    it('explains the 180 day lead limit from RENTAL_VALIDATION_FAILED', () => {
        const error = apiError(400, 'Start date cannot be more than 180 days ahead', 'RENTAL_VALIDATION_FAILED');

        expect(getBookingErrorMessage(error)).toContain('180 days ahead');
    });

    it('explains the open request cap', () => {
        const error = apiError(409, 'You already have 3 open rental requests.', 'OPEN_RENTAL_REQUEST_LIMIT_EXCEEDED');

        expect(getBookingErrorMessage(error)).toContain('3 open rental requests');
    });
});
