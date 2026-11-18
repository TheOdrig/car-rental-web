import { isApiError, isRateLimited, rateLimitMessage } from '@/shared/api';
import { MAX_OPEN_REQUESTS, MAX_LEAD_DAYS, MAX_RENTAL_DAYS, RENTAL_MESSAGES } from './rental-rules';

export const CAR_NOT_AVAILABLE_CODE = 'CAR_NOT_AVAILABLE';
export const OPEN_RENTAL_REQUEST_LIMIT_CODE = 'OPEN_RENTAL_REQUEST_LIMIT_EXCEEDED';
export const VALIDATION_FAILED_CODE = 'VALIDATION_FAILED';
export const RENTAL_VALIDATION_FAILED_CODE = 'RENTAL_VALIDATION_FAILED';

export const CAR_BOOKED_MESSAGE =
    'This car is no longer available for the selected dates. Please choose different dates or another car.';

export const OPEN_REQUEST_LIMIT_MESSAGE = `You already have ${MAX_OPEN_REQUESTS} open rental requests. Cancel one or wait for approval before requesting another.`;

export const RENTAL_TOO_LONG_MESSAGE = `Rentals can last at most ${MAX_RENTAL_DAYS} days. Please shorten your rental period.`;
export const RENTAL_TOO_FAR_AHEAD_MESSAGE = `You can only book up to ${MAX_LEAD_DAYS} days ahead. Please pick an earlier start date.`;
export const RENTAL_END_BEFORE_START_MESSAGE = 'The end date must be after the start date.';

export const ADMIN_CAR_NOT_AVAILABLE_MESSAGE =
    'The car cannot be handed over: it is in maintenance or still out on another rental. Resolve the car status or the other rental first.';

function validationTexts(error: { message: string; errors?: Record<string, string> }): string[] {
    return [error.message, ...Object.values(error.errors ?? {})].filter(
        (text): text is string => typeof text === 'string'
    );
}

export function getRentalValidationMessage(error: unknown): string | null {
    if (!isApiError(error) || error.status !== 400) return null;
    if (error.code !== VALIDATION_FAILED_CODE && error.code !== RENTAL_VALIDATION_FAILED_CODE) return null;

    const texts = validationTexts(error);
    if (texts.some((text) => text.includes(RENTAL_MESSAGES.tooLong))) return RENTAL_TOO_LONG_MESSAGE;
    if (texts.some((text) => text.includes(RENTAL_MESSAGES.tooFarAhead))) return RENTAL_TOO_FAR_AHEAD_MESSAGE;
    if (texts.some((text) => text.includes(RENTAL_MESSAGES.endBeforeStart))) return RENTAL_END_BEFORE_START_MESSAGE;
    return null;
}

export function getRentalRequestErrorMessage(error: unknown, fallback: string): string {
    if (isRateLimited(error)) {
        return rateLimitMessage(error.retryAfter);
    }

    if (isApiError(error)) {
        if (error.code === CAR_NOT_AVAILABLE_CODE) {
            return error.status === 409 ? CAR_BOOKED_MESSAGE : error.message;
        }
        if (error.status === 409 && error.code === OPEN_RENTAL_REQUEST_LIMIT_CODE) {
            return OPEN_REQUEST_LIMIT_MESSAGE;
        }
        const validation = getRentalValidationMessage(error);
        if (validation) return validation;
    }

    return error instanceof Error ? error.message : fallback;
}

export function getAdminActionErrorMessage(error: unknown): string {
    if (isRateLimited(error)) {
        return rateLimitMessage(error.retryAfter);
    }

    if (isApiError(error) && error.code === CAR_NOT_AVAILABLE_CODE && (error.status === 409 || error.status === 400)) {
        return ADMIN_CAR_NOT_AVAILABLE_MESSAGE;
    }

    return error instanceof Error ? error.message : 'An unexpected error occurred';
}
