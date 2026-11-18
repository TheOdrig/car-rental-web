import { fieldErrorMessages, isApiError, isRateLimited, rateLimitMessage } from '@/shared/api';
import { MAX_OPEN_REQUESTS, MAX_LEAD_DAYS, MAX_RENTAL_DAYS, RENTAL_MESSAGES } from './rental-rules';

export const CAR_NOT_AVAILABLE_CODE = 'CAR_NOT_AVAILABLE';
export const CAR_DATES_UNAVAILABLE_CODE = 'CAR_DATES_UNAVAILABLE';
export const PAYMENT_NOT_AUTHORIZED_CODE = 'PAYMENT_NOT_AUTHORIZED';
export const PAYMENT_NOT_FOUND_CODE = 'PAYMENT_NOT_FOUND';
export const OPEN_RENTAL_REQUEST_LIMIT_CODE = 'OPEN_RENTAL_REQUEST_LIMIT_EXCEEDED';
export const VALIDATION_FAILED_CODE = 'VALIDATION_FAILED';
export const RENTAL_VALIDATION_FAILED_CODE = 'RENTAL_VALIDATION_FAILED';

export const CAR_BOOKED_MESSAGE =
    'This car is no longer available for the selected dates. Please choose different dates or another car.';

export const OPEN_REQUEST_LIMIT_MESSAGE = `You already have ${MAX_OPEN_REQUESTS} open rental requests. Cancel one or wait for approval before requesting another.`;

export const RENTAL_TOO_LONG_MESSAGE = `Rentals can last at most ${MAX_RENTAL_DAYS} days. Please shorten your rental period.`;
export const RENTAL_TOO_FAR_AHEAD_MESSAGE = `You can only book up to ${MAX_LEAD_DAYS} days ahead. Please pick an earlier start date.`;
export const RENTAL_END_BEFORE_START_MESSAGE = 'The end date must be after the start date.';

export const PAYMENT_FAILED_CODE = 'PAYMENT_FAILED';
export const RENTAL_CANCEL_NOT_ALLOWED_CODE = 'RENTAL_CANCEL_NOT_ALLOWED';

export const RENTAL_CANCEL_NOT_ALLOWED_MESSAGE =
    'This rental can no longer be cancelled online. Rentals that are already in use have to be returned instead.';

export const PICKUP_PAYMENT_REQUIRED_MESSAGE =
    'Pickup needs an authorized payment. Ask the customer to pay for this rental first; the payment is captured at pickup.';
export const PICKUP_PAYMENT_CAPTURE_FAILED_MESSAGE =
    'The payment could not be captured, so the pickup was not recorded. Check the payment status and try again.';

export const ADMIN_CAR_NOT_AVAILABLE_MESSAGE =
    'The car cannot be handed over: it is in maintenance or still out on another rental. Resolve the car status or the other rental first.';

export const PICKUP_BEFORE_START_MESSAGE = 'Pickup can only be recorded from the rental start date.';

export function isBeforeRentalStart(startDate: string | undefined, now: Date = new Date()): boolean {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(startDate ?? '');
    if (!match) return false;
    const start = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return today < start;
}

const RENTAL_DATE_FIELDS = ['startDate', 'endDate'] as const;

export function getRentalValidationMessage(error: unknown): string | null {
    if (!isApiError(error) || error.status !== 400) return null;
    if (error.code !== VALIDATION_FAILED_CODE && error.code !== RENTAL_VALIDATION_FAILED_CODE) return null;

    const texts = [
        ...(error.code === RENTAL_VALIDATION_FAILED_CODE ? [error.message] : []),
        ...RENTAL_DATE_FIELDS.flatMap((field) => fieldErrorMessages(error, field)),
    ];
    if (texts.some((text) => text.includes(RENTAL_MESSAGES.tooLong))) return RENTAL_TOO_LONG_MESSAGE;
    if (texts.some((text) => text.includes(RENTAL_MESSAGES.tooFarAhead))) return RENTAL_TOO_FAR_AHEAD_MESSAGE;
    if (texts.some((text) => text.includes(RENTAL_MESSAGES.endBeforeStart))) return RENTAL_END_BEFORE_START_MESSAGE;
    return null;
}

export function getRentalFieldErrors(error: unknown): Partial<Record<(typeof RENTAL_DATE_FIELDS)[number], string>> {
    const result: Partial<Record<(typeof RENTAL_DATE_FIELDS)[number], string>> = {};

    for (const field of RENTAL_DATE_FIELDS) {
        const [first] = fieldErrorMessages(error, field);
        if (first) result[field] = first;
    }

    if (Object.keys(result).length === 0 && isApiError(error) && error.status === 400 && error.code === RENTAL_VALIDATION_FAILED_CODE) {
        const message = getRentalValidationMessage(error) ?? error.message;
        if (error.message === RENTAL_MESSAGES.startInPast || error.message.includes(RENTAL_MESSAGES.tooFarAhead)) {
            result.startDate = message;
        } else if (error.message.includes(RENTAL_MESSAGES.endBeforeStart) || error.message.includes(RENTAL_MESSAGES.tooLong)) {
            result.endDate = message;
        }
    }

    return result;
}

export function getRentalRequestErrorMessage(error: unknown, fallback: string): string {
    if (isRateLimited(error)) {
        return rateLimitMessage(error.retryAfter);
    }

    if (isApiError(error)) {
        if (error.code === CAR_DATES_UNAVAILABLE_CODE) {
            return CAR_BOOKED_MESSAGE;
        }
        if (error.code === CAR_NOT_AVAILABLE_CODE) {
            return error.message;
        }
        if (error.status === 409 && error.code === OPEN_RENTAL_REQUEST_LIMIT_CODE) {
            return OPEN_REQUEST_LIMIT_MESSAGE;
        }
        const validation = getRentalValidationMessage(error);
        if (validation) return validation;
    }

    return error instanceof Error ? error.message : fallback;
}

const CANCEL_FALLBACK_MESSAGE = 'Failed to cancel rental';

export function getRentalCancelErrorMessage(error: unknown): string {
    if (isRateLimited(error)) {
        return rateLimitMessage(error.retryAfter);
    }

    if (isApiError(error) && error.code === RENTAL_CANCEL_NOT_ALLOWED_CODE) {
        return RENTAL_CANCEL_NOT_ALLOWED_MESSAGE;
    }

    return error instanceof Error ? error.message : CANCEL_FALLBACK_MESSAGE;
}

export function getAdminActionErrorMessage(error: unknown): string {
    if (isRateLimited(error)) {
        return rateLimitMessage(error.retryAfter);
    }

    if (isApiError(error)) {
        if (error.code === CAR_NOT_AVAILABLE_CODE || error.code === CAR_DATES_UNAVAILABLE_CODE) {
            return ADMIN_CAR_NOT_AVAILABLE_MESSAGE;
        }
        if (error.status === 400 && error.code === RENTAL_VALIDATION_FAILED_CODE && error.message) {
            return error.message;
        }
        if (error.code === PAYMENT_NOT_AUTHORIZED_CODE || error.code === PAYMENT_NOT_FOUND_CODE) {
            return PICKUP_PAYMENT_REQUIRED_MESSAGE;
        }
        if (error.code === PAYMENT_FAILED_CODE && error.status === 402) {
            return PICKUP_PAYMENT_CAPTURE_FAILED_MESSAGE;
        }
    }

    return error instanceof Error ? error.message : 'An unexpected error occurred';
}
