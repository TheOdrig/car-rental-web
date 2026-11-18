import { describe, it, expect } from 'vitest';
import { ApiError } from '@/shared/api';
import {
    ADMIN_CAR_NOT_AVAILABLE_MESSAGE,
    CAR_BOOKED_MESSAGE,
    OPEN_REQUEST_LIMIT_MESSAGE,
    RENTAL_END_BEFORE_START_MESSAGE,
    RENTAL_TOO_FAR_AHEAD_MESSAGE,
    RENTAL_TOO_LONG_MESSAGE,
    getAdminActionErrorMessage,
    getRentalRequestErrorMessage,
} from '../rental-errors';

function apiError(
    status: number,
    message: string,
    code?: string,
    extra: { retryAfter?: number; errors?: Record<string, string> } = {}
): ApiError {
    return new ApiError({ status, message, timestamp: new Date().toISOString(), code, ...extra });
}

describe('getRentalRequestErrorMessage', () => {
    it('maps VALIDATION_FAILED for the 30 day limit using the field errors', () => {
        const error = apiError(400, 'Validation failed', 'VALIDATION_FAILED', {
            errors: { withinMaxRentalLength: 'Rental cannot be longer than 30 days' },
        });
        expect(getRentalRequestErrorMessage(error, 'x')).toBe(RENTAL_TOO_LONG_MESSAGE);
    });

    it('maps RENTAL_VALIDATION_FAILED for the 30 day limit using the message', () => {
        const error = apiError(400, 'Rental cannot be longer than 30 days', 'RENTAL_VALIDATION_FAILED');
        expect(getRentalRequestErrorMessage(error, 'x')).toBe(RENTAL_TOO_LONG_MESSAGE);
    });

    it('maps VALIDATION_FAILED for the 180 day lead limit', () => {
        const error = apiError(400, 'Validation failed', 'VALIDATION_FAILED', {
            errors: { withinMaxLeadTime: 'Start date cannot be more than 180 days ahead' },
        });
        expect(getRentalRequestErrorMessage(error, 'x')).toBe(RENTAL_TOO_FAR_AHEAD_MESSAGE);
    });

    it('maps RENTAL_VALIDATION_FAILED for the 180 day lead limit', () => {
        const error = apiError(400, 'Start date cannot be more than 180 days ahead', 'RENTAL_VALIDATION_FAILED');
        expect(getRentalRequestErrorMessage(error, 'x')).toBe(RENTAL_TOO_FAR_AHEAD_MESSAGE);
    });

    it('maps the end date order error from either code', () => {
        const fromBean = apiError(400, 'Validation failed', 'VALIDATION_FAILED', {
            errors: { endDateAfterStartDate: 'End date must be after start date' },
        });
        const fromService = apiError(400, 'End date must be after start date', 'RENTAL_VALIDATION_FAILED');
        expect(getRentalRequestErrorMessage(fromBean, 'x')).toBe(RENTAL_END_BEFORE_START_MESSAGE);
        expect(getRentalRequestErrorMessage(fromService, 'x')).toBe(RENTAL_END_BEFORE_START_MESSAGE);
    });

    it('keeps the API message for other validation failures', () => {
        const error = apiError(400, 'Start date cannot be in the past', 'RENTAL_VALIDATION_FAILED');
        expect(getRentalRequestErrorMessage(error, 'x')).toBe('Start date cannot be in the past');
    });

    it('does not remap validation messages on other statuses', () => {
        const error = apiError(500, 'Rental cannot be longer than 30 days', 'RENTAL_VALIDATION_FAILED');
        expect(getRentalRequestErrorMessage(error, 'x')).toBe('Rental cannot be longer than 30 days');
    });

    it('maps the open request cap', () => {
        const error = apiError(409, 'You already have 3 open rental requests.', 'OPEN_RENTAL_REQUEST_LIMIT_EXCEEDED');
        expect(getRentalRequestErrorMessage(error, 'x')).toBe(OPEN_REQUEST_LIMIT_MESSAGE);
    });

    it('shows the retry hint on a rate limit', () => {
        const error = apiError(429, 'Too many requests', 'RATE_LIMIT_EXCEEDED', { retryAfter: 45 });
        expect(getRentalRequestErrorMessage(error, 'x')).toBe('Too many attempts. Please try again in 45 seconds.');
    });

    it('rounds a long retry hint up to minutes', () => {
        const error = apiError(429, 'Too many requests', 'RATE_LIMIT_EXCEEDED', { retryAfter: 90 });
        expect(getRentalRequestErrorMessage(error, 'x')).toBe('Too many attempts. Please try again in 2 minutes.');
    });

    it('keeps the booked-dates and unavailable messages', () => {
        expect(getRentalRequestErrorMessage(apiError(409, 'booked', 'CAR_NOT_AVAILABLE'), 'x')).toBe(CAR_BOOKED_MESSAGE);
        expect(getRentalRequestErrorMessage(apiError(400, 'in maintenance', 'CAR_NOT_AVAILABLE'), 'x')).toBe('in maintenance');
    });

    it('falls back for unknown errors', () => {
        expect(getRentalRequestErrorMessage('weird', 'fallback')).toBe('fallback');
        expect(getRentalRequestErrorMessage(new Error('Boom'), 'fallback')).toBe('Boom');
    });
});

describe('getAdminActionErrorMessage', () => {
    it('explains a 409 CAR_NOT_AVAILABLE for an admin', () => {
        const error = apiError(409, 'Car with id 5 is still out on another rental', 'CAR_NOT_AVAILABLE');
        expect(getAdminActionErrorMessage(error)).toBe(ADMIN_CAR_NOT_AVAILABLE_MESSAGE);
    });

    it('explains a 400 CAR_NOT_AVAILABLE for an admin', () => {
        const error = apiError(400, 'Car with id 5 is not available for rental. Reason: Maintenance', 'CAR_NOT_AVAILABLE');
        expect(getAdminActionErrorMessage(error)).toBe(ADMIN_CAR_NOT_AVAILABLE_MESSAGE);
    });

    it('shows the retry hint on a rate limit', () => {
        const error = apiError(429, 'Too many', 'RATE_LIMIT_EXCEEDED', { retryAfter: 1 });
        expect(getAdminActionErrorMessage(error)).toBe('Too many attempts. Please try again in 1 second.');
    });

    it('keeps other API messages and falls back for non-errors', () => {
        expect(getAdminActionErrorMessage(apiError(409, 'Invalid state', 'INVALID_RENTAL_STATE'))).toBe('Invalid state');
        expect(getAdminActionErrorMessage(null)).toBe('An unexpected error occurred');
    });
});
