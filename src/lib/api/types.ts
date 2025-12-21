export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface BaseRequestOptions {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
}

export interface ClientRequestOptions extends BaseRequestOptions {
    signal?: AbortSignal;
}

export interface ServerRequestOptions extends BaseRequestOptions {
    cache?: RequestCache;
    revalidate?: number | false;
    tags?: string[];
}
