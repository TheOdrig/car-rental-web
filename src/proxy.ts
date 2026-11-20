import { NextResponse, type NextRequest } from 'next/server';
import { classifyRoute } from '@/shared/config/route-access';
import { safeRedirectPath } from '@/shared/lib/safe-redirect';
import {
    ACCESS_COOKIE,
    REFRESH_COOKIE,
    buildAuthCookies,
    clientIpFromRequestHeaders,
    isAdminSession,
    mergeCookieHeader,
    refreshAuthSession,
    verifyAccessToken,
    type AuthResponse,
    type Session,
} from '@/shared/server';
import { ROUTES } from '@/shared/config/routes';

function redirectToLogin(request: NextRequest, clearCookies: boolean): NextResponse {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set('callbackUrl', `${request.nextUrl.pathname}${request.nextUrl.search}`);

    const response = NextResponse.redirect(loginUrl);
    if (clearCookies) {
        response.cookies.delete(ACCESS_COOKIE);
        response.cookies.delete(REFRESH_COOKIE);
    }

    return response;
}

function passThrough(request: NextRequest, renewed: AuthResponse | null): NextResponse {
    if (!renewed) {
        return NextResponse.next();
    }

    const headers = new Headers(request.headers);
    const cookies = buildAuthCookies(renewed);
    headers.set(
        'cookie',
        mergeCookieHeader(
            request.headers.get('cookie'),
            cookies.map(({ name, value }) => ({ name, value }))
        )
    );

    const response = NextResponse.next({ request: { headers } });
    for (const { name, value, options } of cookies) {
        response.cookies.set(name, value, options);
    }

    return response;
}

const PROBLEM_CODES: Record<number, { title: string; code: string }> = {
    401: { title: 'Unauthorized', code: 'AUTHENTICATION_FAILED' },
    403: { title: 'Forbidden', code: 'ACCESS_DENIED' },
};

function jsonError(status: number, message: string, clearCookies = false): NextResponse {
    const response = NextResponse.json(
        { type: 'about:blank', status, detail: message, timestamp: new Date().toISOString(), ...PROBLEM_CODES[status] },
        { status, headers: { 'Content-Type': 'application/problem+json', 'Cache-Control': 'private, no-store' } }
    );
    if (clearCookies) {
        response.cookies.delete(ACCESS_COOKIE);
        response.cookies.delete(REFRESH_COOKIE);
    }

    return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
    const access = classifyRoute(request.nextUrl.pathname);

    if (access === 'public' || access === 'auth-flow') {
        return NextResponse.next();
    }

    const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
    let session: Session | null = await verifyAccessToken(accessToken);

    if (access === 'guest-only') {
        if (!session) {
            return NextResponse.next();
        }

        const next = safeRedirectPath(request.nextUrl.searchParams.get('callbackUrl'));
        return NextResponse.redirect(new URL(next, request.url));
    }

    let renewed: AuthResponse | null = null;
    let refreshRejected = false;
    if (!session && refreshToken) {
        const outcome = await refreshAuthSession(refreshToken, clientIpFromRequestHeaders(request.headers));
        renewed = outcome.kind === 'ok' ? outcome.tokens : null;
        refreshRejected = outcome.kind === 'rejected';
        session = renewed ? await verifyAccessToken(renewed.accessToken) : null;
    }

    if (access === 'admin-api') {
        if (!session) {
            return jsonError(401, 'Not authenticated', refreshRejected);
        }

        return isAdminSession(session) ? passThrough(request, renewed) : jsonError(403, 'Forbidden');
    }

    if (!session) {
        return redirectToLogin(request, refreshRejected);
    }

    if (access === 'admin' && !isAdminSession(session)) {
        return NextResponse.redirect(new URL(ROUTES.forbidden, request.url));
    }

    return passThrough(request, renewed);
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.[\\w]+$).*)'],
};
