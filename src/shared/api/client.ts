import { ApiError } from './error';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

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

const getConfig = (options: RequestOptions = {}): RequestInit => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return {
        ...options,
        headers,
    };
};

export const apiClient = {
    async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { params } = options;
        const config = getConfig(options);
        const url = new URL(`${BASE_URL}${endpoint}`);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        const response = await fetch(url.toString(), {
            ...config,
            method: 'GET',
        });

        return handleResponse<T>(response);
    },

    async post<T>(endpoint: string, body: unknown, options: RequestOptions = {}): Promise<T> {
        const config = getConfig(options);
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...config,
            method: 'POST',
            body: JSON.stringify(body),
        });

        return handleResponse<T>(response);
    },

    async put<T>(endpoint: string, body: unknown, options: RequestOptions = {}): Promise<T> {
        const config = getConfig(options);
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...config,
            method: 'PUT',
            body: JSON.stringify(body),
        });

        return handleResponse<T>(response);
    },

    async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const config = getConfig(options);
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...config,
            method: 'DELETE',
        });

        return handleResponse<T>(response);
    },
};
