import type { ApiError as IApiError } from '@/shared/types';

export class ApiError extends Error {
    status: number;
    errors?: Record<string, string>;
    timestamp: string;
    path?: string;
    data?: unknown;
    code?: string;
    retryAfter?: number;

    constructor(
        arg1: IApiError | number | { status: number; message: string; data?: unknown },
        message?: string,
        data?: unknown
    ) {
        if (typeof arg1 === 'number') {
            super(message || 'Api Error');
            this.status = arg1;
            this.data = data;
            this.timestamp = new Date().toISOString();
        } else if ('timestamp' in arg1) {
            super(arg1.message);
            this.status = arg1.status;
            this.errors = arg1.errors;
            this.timestamp = arg1.timestamp;
            this.path = arg1.path;
            this.code = arg1.code;
            this.retryAfter = arg1.retryAfter;
        } else {
            super(arg1.message || message || 'Api Error');
            this.status = arg1.status;
            this.data = arg1.data || data;
            this.timestamp = new Date().toISOString();
        }
        this.name = 'ApiError';
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

export function parseRetryAfter(value: string | null | undefined): number | undefined {
    const trimmed = value?.trim();
    return trimmed && /^[0-9]+$/.test(trimmed) ? Number(trimmed) : undefined;
}

export async function parseErrorResponse(response: Response): Promise<IApiError> {
    const retryAfter = parseRetryAfter(response.headers.get('Retry-After'));

    try {
        const data = await response.json();
        return {
            status: response.status,
            message: data.message || response.statusText,
            timestamp: data.timestamp || new Date().toISOString(),
            path: data.path,
            errors: data.errors ?? data.validationErrors,
            code: data.errorCode ?? data.code,
            retryAfter,
        };
    } catch {
        return {
            status: response.status,
            message: response.statusText || 'An unexpected error occurred',
            timestamp: new Date().toISOString(),
            retryAfter,
        };
    }
}

export function isRateLimited(error: unknown): error is ApiError {
    return isApiError(error) && error.status === 429;
}

export function rateLimitMessage(retryAfter?: number): string {
    if (retryAfter === undefined || retryAfter <= 0) {
        return 'Too many attempts. Please wait a moment and try again.';
    }

    if (retryAfter < 60) {
        return `Too many attempts. Please try again in ${retryAfter} second${retryAfter === 1 ? '' : 's'}.`;
    }

    const minutes = Math.ceil(retryAfter / 60);
    return `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}

export function getFormErrorMessage(error: unknown, fallback: string): string {
    return isRateLimited(error) ? rateLimitMessage(error.retryAfter) : fallback;
}

export function getErrorMessage(error: unknown): string {
    if (isApiError(error)) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
}

export const ApiException = ApiError;