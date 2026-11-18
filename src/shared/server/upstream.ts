import 'server-only';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { ApiError, parseErrorResponse } from '@/shared/api/error';
import type { ServerRequestOptions } from '@/shared/api/types';
import { getServerEnv } from './env';
import {
    getAccessToken,
    getRefreshToken,
    setAuthTokens,
} from './auth-cookies';

const REFRESH_PATH = '/api/auth/refresh';

export const authResponseSchema = z.object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
    expiresIn: z.number().optional(),
    username: z.string().optional(),
    tokenType: z.string().optional(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

export type UpstreamParams = Record<string, string | number | boolean | undefined> | URLSearchParams;

export interface UpstreamOptions extends Omit<ServerRequestOptions, 'method' | 'body' | 'params'> {
    params?: UpstreamParams;
    method?: ServerRequestOptions['method'];
    body?: unknown;
    anonymous?: boolean;
}

export function buildUpstreamUrl(path: string, params?: UpstreamParams): URL {
    const url = new URL(path, `${getServerEnv().API_URL}/`);

    if (params instanceof URLSearchParams) {
        params.forEach((value, key) => url.searchParams.append(key, value));
    } else if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) {
                url.searchParams.append(key, String(value));
            }
        }
    }

    return url;
}

function isTimeout(error: unknown): boolean {
    return error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
}

function timeoutSignal(): AbortSignal {
    return AbortSignal.timeout(getServerEnv().API_TIMEOUT_MS);
}

async function requestRefresh(refreshToken: string): Promise<AuthResponse | null> {
    try {
        const response = await fetch(buildUpstreamUrl(REFRESH_PATH), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
            cache: 'no-store',
            signal: timeoutSignal(),
        });

        if (!response.ok) {
            return null;
        }

        const parsed = authResponseSchema.safeParse(await response.json());
        return parsed.success ? parsed.data : null;
    } catch {
        return null;
    }
}

const REFRESH_SHARE_TTL_MS = 10_000;
const sharedRefreshes = new Map<string, Promise<AuthResponse | null>>();

function refreshKey(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
}

export function resetRefreshCacheForTests(): void {
    sharedRefreshes.clear();
}

export function refreshAuthTokens(refreshToken: string): Promise<AuthResponse | null> {
    const key = refreshKey(refreshToken);
    const existing = sharedRefreshes.get(key);
    if (existing) {
        return existing;
    }

    const pending = requestRefresh(refreshToken);
    sharedRefreshes.set(key, pending);

    void pending.then((tokens) => {
        if (!tokens) {
            sharedRefreshes.delete(key);
            return;
        }

        setTimeout(() => {
            if (sharedRefreshes.get(key) === pending) {
                sharedRefreshes.delete(key);
            }
        }, REFRESH_SHARE_TTL_MS).unref?.();
    });

    return pending;
}

async function ignoreCookieWriteFailure(action: () => Promise<void>): Promise<void> {
    try {
        await action();
    } catch {
        return;
    }
}

export async function renewAccessToken(): Promise<string | undefined> {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
        return undefined;
    }

    const tokens = await refreshAuthTokens(refreshToken);
    if (!tokens) {
        return undefined;
    }

    await ignoreCookieWriteFailure(() => setAuthTokens(tokens));
    return tokens.accessToken;
}

async function sendUpstream(url: URL, options: UpstreamOptions, token: string | undefined): Promise<Response> {
    try {
        return await fetch(url, { ...buildRequestInit(options, token), signal: timeoutSignal() });
    } catch (error) {
        if (isTimeout(error)) {
            throw new ApiError(504, 'Upstream request timed out');
        }
        throw error;
    }
}

function buildRequestInit(options: UpstreamOptions, token: string | undefined): RequestInit & {
    next?: { revalidate?: number | false; tags?: string[] };
} {
    const { method = 'GET', body, headers = {}, cache, revalidate, tags } = options;
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

    const init: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
        method,
        headers: {
            ...(isForm || body === undefined ? {} : { 'Content-Type': 'application/json' }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        cache,
    };

    if (body !== undefined) {
        init.body = isForm ? (body as FormData) : JSON.stringify(body);
    }

    if (revalidate !== undefined || tags) {
        init.next = {};
        if (revalidate !== undefined) init.next.revalidate = revalidate;
        if (tags) init.next.tags = tags;
    }

    return init;
}

export async function upstreamFetch<T>(path: string, options: UpstreamOptions = {}): Promise<T> {
    const url = buildUpstreamUrl(path, options.params);
    const authenticated = !options.anonymous;

    let token = authenticated ? await getAccessToken() : undefined;
    if (authenticated && !token) {
        token = await renewAccessToken();
    }

    let response = await sendUpstream(url, options, token);

    if (response.status === 401 && authenticated) {
        const renewed = await renewAccessToken();
        if (renewed) {
            response = await sendUpstream(url, options, renewed);
        }
    }

    if (!response.ok) {
        throw new ApiError(await parseErrorResponse(response));
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

type MethodOptions = Omit<UpstreamOptions, 'method' | 'body'>;

export const upstream = {
    get: <T>(path: string, options?: MethodOptions) => upstreamFetch<T>(path, { ...options, method: 'GET' }),
    post: <T>(path: string, body?: unknown, options?: MethodOptions) =>
        upstreamFetch<T>(path, { ...options, method: 'POST', body }),
    put: <T>(path: string, body?: unknown, options?: MethodOptions) =>
        upstreamFetch<T>(path, { ...options, method: 'PUT', body }),
    patch: <T>(path: string, body?: unknown, options?: MethodOptions) =>
        upstreamFetch<T>(path, { ...options, method: 'PATCH', body }),
    delete: <T>(path: string, options?: MethodOptions) =>
        upstreamFetch<T>(path, { ...options, method: 'DELETE' }),
};
