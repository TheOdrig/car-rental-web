import { cookies } from 'next/headers';
import { ApiError, parseErrorResponse } from './error';
import { endpoints } from './endpoints';
import type { AuthResponse } from '@/shared/types';

interface FetchOptions {
    method?: string;
    body?: unknown;
    cache?: RequestCache;
    tags?: string[];
    params?: Record<string, string | number | boolean>;
}

async function tryRefreshToken(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refresh_token')?.value;

        if (!refreshToken) {
            return null;
        }

        const response = await fetch(endpoints.auth.refresh, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            return null;
        }

        const data: AuthResponse = await response.json();

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/',
        };

        cookieStore.set('access_token', data.accessToken, {
            ...cookieOptions,
            maxAge: 900,
        });

        cookieStore.set('refresh_token', data.refreshToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24 * 7,
        });

        return data.accessToken;
    } catch {
        return null;
    }
}

export async function authenticatedFetch<T>(
    url: string,
    options: FetchOptions = {}
): Promise<T> {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        accessToken = await tryRefreshToken() ?? undefined;
    }

    const fullUrl = new URL(url, process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082');
    if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined) {
                fullUrl.searchParams.append(key, String(value));
            }
        });
    }

    const makeRequest = async (token?: string): Promise<Response> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return fetch(fullUrl.toString(), {
            method: options.method || 'GET',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            cache: options.cache,
            next: options.tags ? { tags: options.tags } : undefined,
        } as RequestInit);
    };

    let response = await makeRequest(accessToken);
    let didTryRefresh = false;

    if ((response.status === 401 || response.status === 403) && !didTryRefresh) {
        didTryRefresh = true;
        const newToken = await tryRefreshToken();
        if (newToken) {
            response = await makeRequest(newToken);
        }
    }

    if (!response.ok) {
        const error = await parseErrorResponse(response);
        throw new ApiError(error);
    }

    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

export const routeGet = <T>(url: string, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    authenticatedFetch<T>(url, { ...options, method: 'GET' });

export const routePost = <T>(url: string, body?: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    authenticatedFetch<T>(url, { ...options, method: 'POST', body });

export const routePut = <T>(url: string, body?: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    authenticatedFetch<T>(url, { ...options, method: 'PUT', body });

export const routeDelete = <T>(url: string, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    authenticatedFetch<T>(url, { ...options, method: 'DELETE' });

export const routePatch = <T>(url: string, body?: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    authenticatedFetch<T>(url, { ...options, method: 'PATCH', body });
