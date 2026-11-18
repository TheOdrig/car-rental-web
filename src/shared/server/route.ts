import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, isApiError } from '@/shared/api/error';
import { logger } from '@/shared/lib/logger';
import { upstreamFetch, type UpstreamOptions } from './upstream';

type RouteParams = Record<string, string | string[]>;

interface RouteOptions {
    errorMessage: string;
    errorStatus?: number;
}

export function errorResponse(error: unknown, options: RouteOptions): NextResponse {
    if (isApiError(error)) {
        return NextResponse.json(
            { message: error.message, error: error.message, errors: error.errors },
            { status: error.status }
        );
    }

    logger.error('[BFF]', options.errorMessage, error);

    const unreachable = error instanceof TypeError;
    const message = unreachable ? 'Service unavailable' : options.errorMessage;
    const status = unreachable ? 503 : (options.errorStatus ?? 500);

    return NextResponse.json({ message, error: message }, { status });
}

export function route<P extends RouteParams = Record<string, never>>(
    handler: (request: NextRequest, params: P) => Promise<unknown>,
    options: RouteOptions
) {
    return async (request: NextRequest, context: { params: Promise<P> }): Promise<Response> => {
        try {
            const params = await context.params;
            const result = await handler(request, params);

            if (result instanceof Response) {
                return result;
            }

            return NextResponse.json(result ?? {});
        } catch (error) {
            return errorResponse(error, options);
        }
    };
}

export function created(data: unknown): NextResponse {
    return NextResponse.json(data ?? {}, { status: 201 });
}

export function parseIdParam(value: string | undefined, label: string): number {
    const parsed = value !== undefined && /^\d+$/.test(value) ? Number(value) : NaN;

    if (!Number.isSafeInteger(parsed)) {
        throw new ApiError(400, `Invalid ${label}`);
    }

    return parsed;
}

export async function readJson<T = Record<string, unknown>>(request: NextRequest): Promise<T> {
    try {
        return (await request.json()) as T;
    } catch {
        throw new ApiError(400, 'Invalid JSON body');
    }
}

export function searchParamsOf(request: NextRequest): URLSearchParams {
    return new URL(request.url).searchParams;
}

type ProxyBody = 'required' | 'optional' | 'none';

interface ProxyConfig<P extends RouteParams> extends RouteOptions {
    path: (params: P, request: NextRequest) => string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    forwardQuery?: boolean;
    body?: ProxyBody;
    tags?: string[];
    status?: number;
    anonymous?: boolean;
    transformBody?: (body: unknown, params: P) => unknown;
    respond?: (data: unknown) => unknown;
}

async function readOptionalJson(request: NextRequest): Promise<unknown> {
    try {
        return await request.json();
    } catch {
        return undefined;
    }
}

export function proxy<P extends RouteParams = Record<string, never>>(config: ProxyConfig<P>) {
    const method = config.method ?? 'GET';
    const bodyMode: ProxyBody = config.body ?? (method === 'GET' || method === 'DELETE' ? 'none' : 'required');

    return route<P>(async (request, params) => {
        let body: unknown;
        if (bodyMode === 'required') {
            body = await readJson(request);
        } else if (bodyMode === 'optional') {
            body = await readOptionalJson(request);
        }

        if (body !== undefined && config.transformBody) {
            body = config.transformBody(body, params);
        }

        const options: UpstreamOptions = {
            method,
            body,
            cache: 'no-store',
            tags: config.tags,
            anonymous: config.anonymous,
            params: config.forwardQuery ? searchParamsOf(request) : undefined,
        };

        const data = await upstreamFetch<unknown>(config.path(params, request), options);
        const payload = config.respond ? config.respond(data) : data;

        return config.status ? NextResponse.json(payload ?? {}, { status: config.status }) : payload;
    }, config);
}
