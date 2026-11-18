export type CurrencyType = 'TRY' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface FieldProblem {
    field: string;
    message: string;
}

export interface ApiError {
    status: number;
    message: string;
    timestamp: string;
    title?: string;
    type?: string;
    instance?: string;
    traceId?: string;
    errors?: FieldProblem[];
    details?: Record<string, unknown>;
    code?: string;
    retryAfter?: number;
}

export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
}

export interface MessageResponse {
    message: string;
}