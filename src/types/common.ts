export type CurrencyType = 'TRY' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface PageResponse<T> {
    content: T[];
    cars?: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface ApiError {
    status: number;
    message: string;
    timestamp: string;
    path?: string;
    errors?: Record<string, string>;
}

export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
}
