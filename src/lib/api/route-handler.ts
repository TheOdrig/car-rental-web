'use server';

import { cookies } from 'next/headers';
import { ApiException, parseErrorResponse } from './errors';
import { endpoints } from './endpoints';
import type { AuthResponse } from '@/types';

interface FetchOptions {
    method?: string;
    body?: unknown;
    cache?: RequestCache;
    tags?: string[];
}


async function tryRefreshToken(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refresh_token')?.value;

        if (!refreshToken) {
            console.log('[Route Handler] No refresh token available');
            return null;
        }

        console.log('[Route Handler] Attempting token refresh...');
        const response = await fetch(endpoints.auth.refresh, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            console.log('[Route Handler] Token refresh failed with status:', response.status);
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

        console.log('[Route Handler] Token refresh successful');
        return data.accessToken;
    } catch (error) {
        console.error('[Route Handler] Token refresh error:', error);
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

    const makeRequest = async (token?: string): Promise<Response> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return fetch(url, {
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
        throw new ApiException(error);
    }

    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

export async function routeGet<T>(url: string, options?: Omit<FetchOptions, 'method' | 'body'>): Promise<T> {
    return authenticatedFetch<T>(url, { ...options, method: 'GET' });
}

export async function routePost<T>(url: string, body?: unknown, options?: Omit<FetchOptions, 'method' | 'body'>): Promise<T> {
    return authenticatedFetch<T>(url, { ...options, method: 'POST', body });
}

export async function routePut<T>(url: string, body?: unknown, options?: Omit<FetchOptions, 'method' | 'body'>): Promise<T> {
    return authenticatedFetch<T>(url, { ...options, method: 'PUT', body });
}

export async function routeDelete<T>(url: string, options?: Omit<FetchOptions, 'method' | 'body'>): Promise<T> {
    return authenticatedFetch<T>(url, { ...options, method: 'DELETE' });
}

export async function routePatch<T>(url: string, body?: unknown, options?: Omit<FetchOptions, 'method' | 'body'>): Promise<T> {
    return authenticatedFetch<T>(url, { ...options, method: 'PATCH', body });
}

