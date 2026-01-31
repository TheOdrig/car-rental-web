import type { ApiError as IApiError } from '@/shared/types';

export class ApiError extends Error {
    status: number;
    errors?: Record<string, string>;
    timestamp: string;
    path?: string;
    data?: unknown;

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

export async function parseErrorResponse(response: Response): Promise<IApiError> {
    try {
        const data = await response.json();
        return {
            status: response.status,
            message: data.message || response.statusText,
            timestamp: data.timestamp || new Date().toISOString(),
            path: data.path,
            errors: data.errors,
        };
    } catch {
        return {
            status: response.status,
            message: response.statusText || 'An unexpected error occurred',
            timestamp: new Date().toISOString(),
        };
    }
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
