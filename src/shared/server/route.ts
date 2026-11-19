import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, isApiError } from '@/shared/api/error';
import { logger } from '@/shared/lib/logger';
import { upstreamFetch, type UpstreamOptions } from './upstream';
import type { UpstreamTarget } from './upstream-endpoints';

type RouteParams = Record<string, string | string[]>;

interface RouteOptions {
    errorMessage: string;
    errorStatus?: number;
    contentTypes?: string[];
}

const JSON_CONTENT_TYPE = 'application/json';
const PROBLEM_CONTENT_TYPE = 'application/problem+json';
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
        const site = request.headers.get('sec-fetch-site');
        return site !== null && site !== 'same-origin' && site !== 'none';
    }

    try {
        return new URL(origin).host.toLowerCase() !== requestHost(request);
    } catch {
        return true;
    }
}

function problemResponse(
    status: number,
    detail: string,
    extra: Record<string, unknown> = {},
    headers: Record<string, string> = {}
): NextResponse {
    return NextResponse.json(
        { status, detail, timestamp: new Date().toISOString(), ...extra },
        { status, headers: { 'Content-Type': PROBLEM_CONTENT_TYPE, ...headers } }
    );
}

function guardRequest(request: NextRequest, options: RouteOptions): NextResponse | null {
    if (!STATE_CHANGING_METHODS.has(request.method)) {
        return null;
    }

    if (isCrossOrigin(request)) {
        return problemResponse(403, 'Forbidden', { title: 'Forbidden', code: 'ACCESS_DENIED' });
    }

    if (BODY_METHODS.has(request.method)) {
        const allowed = options.contentTypes ?? [JSON_CONTENT_TYPE];
        if (!allowed.includes(mediaType(request.headers.get('content-type')))) {
            return problemResponse(415, 'Unsupported media type', {
                title: 'Unsupported Media Type',
                code: 'UNSUPPORTED_MEDIA_TYPE',
            });
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

        return problemResponse(
            error.status,
            error.message,
            {
                title: error.title,
                type: error.type,
                instance: error.instance,
                traceId: error.traceId,
                code: error.code,
                errors: error.errors,
                details: error.details,
                ...(error.timestamp ? { timestamp: error.timestamp } : {}),
            },
            headers
        );
    }

    logger.error('[BFF]', options.errorMessage, error);

    const unreachable = error instanceof TypeError;
    const message = unreachable ? 'Service unavailable' : options.errorMessage;
    const status = unreachable ? 503 : (options.errorStatus ?? 500);

    return problemResponse(status, message);
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
    target: (params: P, request: NextRequest) => UpstreamTarget;
    forwardQuery?: boolean;
    transformQuery?: (query: URLSearchParams) => URLSearchParams;
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
    return route<P>(async (request, params) => {
        const target = config.target(params, request);
        const method = target.method;
        const bodyMode: ProxyBody = config.body ?? (method === 'GET' || method === 'DELETE' ? 'none' : 'required');

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
            body,
            cache: 'no-store',
            tags: config.tags,
            anonymous: config.anonymous,
            params: config.forwardQuery
                ? (config.transformQuery ?? ((query) => query))(searchParamsOf(request))
                : undefined,
        };

        const data = await upstreamFetch<unknown>(target, options);
        const payload = config.respond ? config.respond(data) : data;

        return config.status ? NextResponse.json(payload ?? {}, { status: config.status }) : payload;
    }, config);
}
