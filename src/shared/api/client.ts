import { ApiError } from './error';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean>;
}

async function handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        throw new ApiError(
            response.status,
            data.message || response.statusText,
            data
        );
    }

    return data as T;
}

export const apiClient = {
    async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { params, ...init } = options;
        const url = new URL(`${BASE_URL}${endpoint}`);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        const response = await fetch(url.toString(), {
            ...init,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...init.headers,
            },
        });

        return handleResponse<T>(response);
    },

    async post<T>(endpoint: string, body: unknown, options: RequestOptions = {}): Promise<T> {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: JSON.stringify(body),
        });

        return handleResponse<T>(response);
    },

    async put<T>(endpoint: string, body: unknown, options: RequestOptions = {}): Promise<T> {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: JSON.stringify(body),
        });

        return handleResponse<T>(response);
    },

    async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        return handleResponse<T>(response);
    },
};
