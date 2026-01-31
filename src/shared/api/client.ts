import { ApiError, parseErrorResponse } from './error';
import type { ClientRequestOptions } from './types';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
    try {
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.ok;
    } catch {
        return false;
    }
}

async function handleTokenRefresh(): Promise<boolean> {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = refreshToken();

    try {
        const result = await refreshPromise;
        return result;
    } finally {
        isRefreshing = false;
        refreshPromise = null;
    }
}

export async function clientFetch<T>(
    url: string,
    options: ClientRequestOptions = {},
    isRetry = false
): Promise<T> {
    const {
        method = 'GET',
        body,
        headers = {},
        params,
        signal,
    } = options;

    const fullUrl = new URL(url, typeof window !== 'undefined' ? window.location.origin : undefined);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                fullUrl.searchParams.append(key, String(value));
            }
        });
    }

    const fetchOptions: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        credentials: 'include',
        signal,
    };

    if (body) {
        fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(fullUrl.toString(), fetchOptions);

    if (response.status === 401 && !isRetry && !url.includes('/api/auth/refresh') && !url.includes('/api/auth/login')) {
        const refreshed = await handleTokenRefresh();
        if (refreshed) {
            return clientFetch<T>(url, options, true);
        }
    }

    if (!response.ok) {
        const error = await parseErrorResponse(response);
        throw new ApiError(error);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

export const clientGet = <T>(url: string, options?: Omit<ClientRequestOptions, 'method' | 'body'>) =>
    clientFetch<T>(url, { ...options, method: 'GET' });

export const clientPost = <T>(url: string, body?: unknown, options?: Omit<ClientRequestOptions, 'method' | 'body'>) =>
    clientFetch<T>(url, { ...options, method: 'POST', body });

export const clientPut = <T>(url: string, body?: unknown, options?: Omit<ClientRequestOptions, 'method' | 'body'>) =>
    clientFetch<T>(url, { ...options, method: 'PUT', body });

export const clientPatch = <T>(url: string, body?: unknown, options?: Omit<ClientRequestOptions, 'method' | 'body'>) =>
    clientFetch<T>(url, { ...options, method: 'PATCH', body });

export const clientDelete = <T>(url: string, options?: Omit<ClientRequestOptions, 'method' | 'body'>) =>
    clientFetch<T>(url, { ...options, method: 'DELETE' });

export const apiClient = {
    get: clientGet,
    post: clientPost,
    put: clientPut,
    patch: clientPatch,
    delete: clientDelete,
    fetch: clientFetch,
};