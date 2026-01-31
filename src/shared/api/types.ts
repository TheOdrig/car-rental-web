export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface BaseRequestOptions {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean>;
}

export interface ClientRequestOptions extends BaseRequestOptions {
    signal?: AbortSignal;
}

export interface ServerRequestOptions extends BaseRequestOptions {
    cache?: RequestCache;
    revalidate?: number | false;
    tags?: string[];
}
