import { ApiException, parseErrorResponse } from './errors';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
}

export async function clientFetch<T>(
    url: string,
    options: RequestOptions = {}
): Promise<T> {
    const {
        method = 'GET',
        body,
        headers = {},
        signal,
    } = options;

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

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        const error = await parseErrorResponse(response);
        throw new ApiException(error);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

export async function clientGet<T>(
    url: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
    return clientFetch<T>(url, { ...options, method: 'GET' });
}

export async function clientPost<T>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
    return clientFetch<T>(url, { ...options, method: 'POST', body });
}

export async function clientPut<T>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
    return clientFetch<T>(url, { ...options, method: 'PUT', body });
}

export async function clientPatch<T>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
    return clientFetch<T>(url, { ...options, method: 'PATCH', body });
}

export async function clientDelete<T>(
    url: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
    return clientFetch<T>(url, { ...options, method: 'DELETE' });
}
