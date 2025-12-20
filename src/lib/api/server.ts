'use server';

import { cookies } from 'next/headers';
import { ApiException, parseErrorResponse } from './errors';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    cache?: RequestCache;
    revalidate?: number | false;
    tags?: string[];
}

async function getAuthHeader(): Promise<Record<string, string>> {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (token) {
        return { Authorization: `Bearer ${token}` };
    }
    return {};
}

export async function serverFetch<T>(
    url: string,
    options: RequestOptions = {}
): Promise<T> {
    const {
        method = 'GET',
        body,
        headers = {},
        cache,
        revalidate,
        tags,
    } = options;

    const authHeader = await getAuthHeader();

    const fetchOptions: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...authHeader,
            ...headers,
        },
        cache,
    };

    if (body) {
        fetchOptions.body = JSON.stringify(body);
    }

    if (revalidate !== undefined || tags) {
        fetchOptions.next = {};
        if (revalidate !== undefined) {
            fetchOptions.next.revalidate = revalidate;
        }
        if (tags) {
            fetchOptions.next.tags = tags;
        }
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

export async function serverGet<T>(
    url: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
    return serverFetch<T>(url, { ...options, method: 'GET' });
}

export async function serverPost<T>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
    return serverFetch<T>(url, { ...options, method: 'POST', body });
}

export async function serverPut<T>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
    return serverFetch<T>(url, { ...options, method: 'PUT', body });
}

export async function serverPatch<T>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
    return serverFetch<T>(url, { ...options, method: 'PATCH', body });
}

export async function serverDelete<T>(
    url: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
    return serverFetch<T>(url, { ...options, method: 'DELETE' });
}
