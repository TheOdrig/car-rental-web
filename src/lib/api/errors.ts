import { ApiError } from '@/types';

export class ApiException extends Error {
    status: number;
    errors?: Record<string, string>;
    timestamp: string;
    path?: string;

    constructor(error: ApiError) {
        super(error.message);
        this.name = 'ApiException';
        this.status = error.status;
        this.errors = error.errors;
        this.timestamp = error.timestamp;
        this.path = error.path;
    }
}

export function isApiException(error: unknown): error is ApiException {
    return error instanceof ApiException;
}

export async function parseErrorResponse(response: Response): Promise<ApiError> {
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
    if (isApiException(error)) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
}
