import type { ApiError as IApiError, FieldProblem } from '@/shared/types';

export class ApiError extends Error {
    status: number;
    errors?: FieldProblem[];
    timestamp: string;
    title?: string;
    type?: string;
    instance?: string;
    traceId?: string;
    details?: Record<string, unknown>;
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
            this.title = arg1.title;
            this.type = arg1.type;
            this.instance = arg1.instance;
            this.traceId = arg1.traceId;
            this.details = arg1.details;
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

function text(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseFieldProblems(value: unknown): FieldProblem[] | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }

    const problems = value.filter(
        (entry): entry is FieldProblem =>
            isRecord(entry) && typeof entry.field === 'string' && typeof entry.message === 'string'
    );

    return problems.length > 0 ? problems.map(({ field, message }) => ({ field, message })) : undefined;
}

export function fieldErrorMap(error: unknown): Record<string, string> {
    const result: Record<string, string> = {};

    if (isApiError(error)) {
        for (const { field, message } of error.errors ?? []) {
            result[field] = result[field] ? `${result[field]} ${message}` : message;
        }
    }

    return result;
}

export function fieldErrorMessages(error: unknown, field: string): string[] {
    if (!isApiError(error)) {
        return [];
    }

    return (error.errors ?? []).filter((entry) => entry.field === field).map((entry) => entry.message);
}

export function detailString(error: unknown, key: string): string | undefined {
    return isApiError(error) ? text(error.details?.[key]) : undefined;
}

export async function parseErrorResponse(response: Response): Promise<IApiError> {
    const retryAfter = parseRetryAfter(response.headers.get('Retry-After'));

    try {
        const data: unknown = await response.json();
        const body = isRecord(data) ? data : {};

        return {
            status: response.status,
            message: text(body.detail) ?? text(body.message) ?? text(body.title) ?? response.statusText,
            timestamp: text(body.timestamp) ?? new Date().toISOString(),
            title: text(body.title),
            type: text(body.type),
            instance: text(body.instance),
            traceId: text(body.traceId),
            code: text(body.code),
            errors: parseFieldProblems(body.errors),
            details: isRecord(body.details) ? body.details : undefined,
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