import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, isApiError } from '@/shared/api/error';
import { logger } from '@/shared/lib/logger';
import { upstreamFetch, type UpstreamOptions } from './upstream';

type RouteParams = Record<string, string | string[]>;

interface RouteOptions {
    errorMessage: string;
    errorStatus?: number;
    contentTypes?: string[];
}

const JSON_CONTENT_TYPE = 'application/json';
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH']);
const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function mediaType(value: string | null): string {
    return (value ?? '').split(';')[0].trim().toLowerCase();
}

function requestHost(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-host')?.split(',')[0].trim();
    return (forwarded || request.headers.get('host') || request.nextUrl.host).toLowerCase();
}

function isCrossOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    if (origin === null) {
        return false;
    }

    try {
        return new URL(origin).host.toLowerCase() !== requestHost(request);
    } catch {
        return true;
    }
}

function guardRequest(request: NextRequest, options: RouteOptions): NextResponse | null {
    if (!STATE_CHANGING_METHODS.has(request.method)) {
        return null;
    }

    if (isCrossOrigin(request)) {
        return NextResponse.json({ message: 'Forbidden', error: 'Forbidden' }, { status: 403 });
    }

    if (BODY_METHODS.has(request.method)) {
        const allowed = options.contentTypes ?? [JSON_CONTENT_TYPE];
        if (!allowed.includes(mediaType(request.headers.get('content-type')))) {
            return NextResponse.json(
                { message: 'Unsupported media type', error: 'Unsupported media type' },
                { status: 415 }
            );
        }
    }

    return null;
}

export function errorResponse(error: unknown, options: RouteOptions): NextResponse {
    if (isApiError(error)) {
        const headers: Record<string, string> = {};
        if (error.retryAfter !== undefined) {
            headers['Retry-After'] = String(error.retryAfter);
        }

        return NextResponse.json(
            { message: error.message, error: error.message, errors: error.errors, code: error.code },
            { status: error.status, headers }
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
        const rejected = guardRequest(request, options);
        if (rejected) {
            return rejected;
        }

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
