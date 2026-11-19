import { describe, it, expect } from 'vitest';
import { ApiError } from '@/shared/api';
import {
    ADMIN_CAR_NOT_AVAILABLE_MESSAGE,
    CAR_BOOKED_MESSAGE,
    OPEN_REQUEST_LIMIT_MESSAGE,
    RENTAL_END_BEFORE_START_MESSAGE,
    RENTAL_TOO_FAR_AHEAD_MESSAGE,
    RENTAL_TOO_LONG_MESSAGE,
    PICKUP_PAYMENT_REQUIRED_MESSAGE,
    RENTAL_CANCEL_NOT_ALLOWED_MESSAGE,
    getAdminActionErrorMessage,
    getRentalCancelErrorMessage,
    getRentalFieldErrors,
    getRentalRequestErrorMessage,
} from '../rental-errors';

function apiError(
    status: number,
    message: string,
    code?: string,
    extra: { retryAfter?: number; errors?: Array<{ field: string; message: string }> } = {}
): ApiError {
    return new ApiError({ status, message, timestamp: new Date().toISOString(), code, ...extra });
}

describe('getRentalFieldErrors for RENTAL_VALIDATION_FAILED', () => {
    it('puts a start date violation on the start date field', () => {
        const error = apiError(400, 'Start date cannot be in the past', 'RENTAL_VALIDATION_FAILED');
        expect(getRentalFieldErrors(error)).toEqual({ startDate: 'Start date cannot be in the past' });
    });

    it('puts the lead time violation on the start date field with the friendly text', () => {
        const error = apiError(400, 'Start date cannot be more than 180 days ahead', 'RENTAL_VALIDATION_FAILED');
        expect(getRentalFieldErrors(error)).toEqual({ startDate: RENTAL_TOO_FAR_AHEAD_MESSAGE });
    });

    it('puts length and order violations on the end date field', () => {
        expect(getRentalFieldErrors(apiError(400, 'Rental cannot be longer than 30 days', 'RENTAL_VALIDATION_FAILED'))).toEqual({
            endDate: RENTAL_TOO_LONG_MESSAGE,
        });
        expect(getRentalFieldErrors(apiError(400, 'End date must be after start date', 'RENTAL_VALIDATION_FAILED'))).toEqual({
            endDate: RENTAL_END_BEFORE_START_MESSAGE,
        });
    });

    it('leaves unrelated messages to the form level error', () => {
        expect(getRentalFieldErrors(apiError(400, 'Something else', 'RENTAL_VALIDATION_FAILED'))).toEqual({});
    });
});

describe('getRentalRequestErrorMessage', () => {
    it('maps VALIDATION_FAILED for the 30 day limit using the field errors', () => {
        const error = apiError(400, 'Validation failed', 'VALIDATION_FAILED', {
            errors: [{ field: 'endDate', message: 'Rental cannot be longer than 30 days' }],
        });
        expect(getRentalRequestErrorMessage(error, 'x')).toBe(RENTAL_TOO_LONG_MESSAGE);
    });

    it('maps RENTAL_VALIDATION_FAILED for the 30 day limit using the message', () => {
        const error = apiError(400, 'Rental cannot be longer than 30 days', 'RENTAL_VALIDATION_FAILED');
        expect(getRentalRequestErrorMessage(error, 'x')).toBe(RENTAL_TOO_LONG_MESSAGE);
    });

    it('maps VALIDATION_FAILED for the 180 day lead limit', () => {
        const error = apiError(400, 'Validation failed', 'VALIDATION_FAILED', {
            errors: [{ field: 'startDate', message: 'Start date cannot be more than 180 days ahead' }],
        });
        expect(getRentalRequestErrorMessage(error, 'x')).toBe(RENTAL_TOO_FAR_AHEAD_MESSAGE);
    });

    it('maps RENTAL_VALIDATION_FAILED for the 180 day lead limit', () => {
        const error = apiError(400, 'Start date cannot be more than 180 days ahead', 'RENTAL_VALIDATION_FAILED');
        expect(getRentalRequestErrorMessage(error, 'x')).toBe(RENTAL_TOO_FAR_AHEAD_MESSAGE);
    });

    it('maps the end date order error from either code', () => {
        const fromBean = apiError(400, 'Validation failed', 'VALIDATION_FAILED', {
            errors: [{ field: 'endDate', message: 'End date must be after start date' }],
        });
        const fromService = apiError(400, 'End date must be after start date', 'RENTAL_VALIDATION_FAILED');
        expect(getRentalRequestErrorMessage(fromBean, 'x')).toBe(RENTAL_END_BEFORE_START_MESSAGE);
        expect(getRentalRequestErrorMessage(fromService, 'x')).toBe(RENTAL_END_BEFORE_START_MESSAGE);
    });

    it('keeps the API message for other validation failures', () => {
        const error = apiError(400, 'Start date cannot be in the past', 'RENTAL_VALIDATION_FAILED');
        expect(getRentalRequestErrorMessage(error, 'x')).toBe('Start date cannot be in the past');
    });

    it('shows the detail of a RENTAL_VALIDATION_FAILED answer when the configured limit differs', () => {
        const error = apiError(400, 'Rental cannot be longer than 14 days', 'RENTAL_VALIDATION_FAILED');
        expect(getRentalRequestErrorMessage(error, 'x')).toBe('Rental cannot be longer than 14 days');
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
        expect(getRentalRequestErrorMessage(apiError(409, 'booked', 'CAR_DATES_UNAVAILABLE'), 'x')).toBe(CAR_BOOKED_MESSAGE);
        expect(getRentalRequestErrorMessage(apiError(400, 'Reason: Car status is: Maintenance', 'CAR_NOT_AVAILABLE'), 'x')).toMatch(/in maintenance/);
        expect(getRentalRequestErrorMessage(apiError(409, 'in use', 'CAR_NOT_AVAILABLE'), 'x')).toBe(CAR_BOOKED_MESSAGE);
    });

    it('falls back for unknown errors', () => {
        expect(getRentalRequestErrorMessage('weird', 'fallback')).toBe('fallback');
        expect(getRentalRequestErrorMessage(new Error('Boom'), 'fallback')).toBe('Boom');
    });
});

describe('getAdminActionErrorMessage', () => {
    it('explains a 409 CAR_DATES_UNAVAILABLE for an admin', () => {
        const error = apiError(409, 'Car with id 5 is still out on another rental', 'CAR_DATES_UNAVAILABLE');
        expect(getAdminActionErrorMessage(error)).toBe(ADMIN_CAR_NOT_AVAILABLE_MESSAGE);
    });

    it('explains a 400 CAR_NOT_AVAILABLE for an admin', () => {
        const error = apiError(400, 'Car with id 5 is not available for rental. Reason: Maintenance', 'CAR_NOT_AVAILABLE');
        expect(getAdminActionErrorMessage(error)).toBe(ADMIN_CAR_NOT_AVAILABLE_MESSAGE);
    });

    it('maps unauthorized and missing payments to the pickup hint', () => {
        expect(getAdminActionErrorMessage(apiError(409, 'x', 'PAYMENT_NOT_AUTHORIZED'))).toBe(PICKUP_PAYMENT_REQUIRED_MESSAGE);
        expect(getAdminActionErrorMessage(apiError(404, 'x', 'PAYMENT_NOT_FOUND'))).toBe(PICKUP_PAYMENT_REQUIRED_MESSAGE);
    });

    it('maps the date fields of a rental request to form fields', () => {
        const error = apiError(400, 'Validation failed', 'VALIDATION_FAILED', {
            errors: [
                { field: 'endDate', message: 'End date must be after start date' },
                { field: 'startDate', message: 'Start date cannot be in the past' },
                { field: 'notes', message: 'too long' },
            ],
        });
        expect(getRentalFieldErrors(error)).toEqual({
            startDate: 'Start date cannot be in the past',
            endDate: 'End date must be after start date',
        });
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

describe('getRentalCancelErrorMessage', () => {
    it('explains RENTAL_CANCEL_NOT_ALLOWED', () => {
        const error = apiError(400, 'Rental cannot be cancelled in its current status', 'RENTAL_CANCEL_NOT_ALLOWED');

        expect(getRentalCancelErrorMessage(error)).toBe(RENTAL_CANCEL_NOT_ALLOWED_MESSAGE);
    });

    it('keeps the API message for other failures', () => {
        expect(getRentalCancelErrorMessage(apiError(404, 'Rental not found', 'RENTAL_NOT_FOUND'))).toBe('Rental not found');
    });

    it('formats rate limits and tolerates non-Error values', () => {
        expect(getRentalCancelErrorMessage(apiError(429, 'slow', 'RATE_LIMIT_EXCEEDED', { retryAfter: 30 }))).toContain('30');
        expect(getRentalCancelErrorMessage('boom')).toBe('Failed to cancel rental');
    });
});
