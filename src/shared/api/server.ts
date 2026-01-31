import { cookies } from 'next/headers';
import { ApiError, parseErrorResponse } from './error';
import type { ServerRequestOptions } from './types';

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
    options: ServerRequestOptions = {}
): Promise<T> {
    const {
        method = 'GET',
        body,
        headers = {},
        params,
        cache,
        revalidate,
        tags,
    } = options;

    const authHeader = await getAuthHeader();
    const fullUrl = new URL(url, process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082');

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                fullUrl.searchParams.append(key, String(value));
            }
        });
    }

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

    const response = await fetch(fullUrl.toString(), fetchOptions);

    if (!response.ok) {
        const error = await parseErrorResponse(response);
        throw new ApiError(error);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

export const serverGet = <T>(url: string, options?: Omit<ServerRequestOptions, 'method' | 'body'>) =>
    serverFetch<T>(url, { ...options, method: 'GET' });

export const serverPost = <T>(url: string, body?: unknown, options?: Omit<ServerRequestOptions, 'method' | 'body'>) =>
    serverFetch<T>(url, { ...options, method: 'POST', body });

export const serverPut = <T>(url: string, body?: unknown, options?: Omit<ServerRequestOptions, 'method' | 'body'>) =>
    serverFetch<T>(url, { ...options, method: 'PUT', body });

export const serverPatch = <T>(url: string, body?: unknown, options?: Omit<ServerRequestOptions, 'method' | 'body'>) =>
    serverFetch<T>(url, { ...options, method: 'PATCH', body });

export const serverDelete = <T>(url: string, options?: Omit<ServerRequestOptions, 'method' | 'body'>) =>
    serverFetch<T>(url, { ...options, method: 'DELETE' });

export const serverApi = {
    get: serverGet,
    post: serverPost,
    put: serverPut,
    patch: serverPatch,
    delete: serverDelete,
    fetch: serverFetch,
};
