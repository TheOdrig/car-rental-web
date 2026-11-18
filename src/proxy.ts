import { NextResponse, type NextRequest } from 'next/server';
import { classifyRoute } from '@/shared/config/route-access';
import {
    ACCESS_COOKIE,
    REFRESH_COOKIE,
    buildAuthCookies,
    isAdminSession,
    mergeCookieHeader,
    refreshAuthTokens,
    verifyAccessToken,
    type AuthResponse,
    type Session,
} from '@/shared/server';

function redirectToLogin(request: NextRequest, staleRefresh: boolean): NextResponse {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', `${request.nextUrl.pathname}${request.nextUrl.search}`);

    const response = NextResponse.redirect(loginUrl);
    if (staleRefresh) {
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

function jsonError(status: number, message: string): NextResponse {
    return NextResponse.json({ message, error: message }, { status });
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
        return session ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next();
    }

    if (access === 'admin-api') {
        if (!session && !refreshToken) {
            return jsonError(401, 'Not authenticated');
        }

        if (session && !isAdminSession(session)) {
            return jsonError(403, 'Forbidden');
        }

        return NextResponse.next();
    }

    let renewed: AuthResponse | null = null;
    if (!session && refreshToken) {
        renewed = await refreshAuthTokens(refreshToken);
        session = renewed ? await verifyAccessToken(renewed.accessToken) : null;
    }

    if (!session) {
        return redirectToLogin(request, !!refreshToken);
    }

    if (access === 'admin' && !isAdminSession(session)) {
        return NextResponse.redirect(new URL('/forbidden', request.url));
    }

    return passThrough(request, renewed);
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.[\\w]+$).*)'],
};
