import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken, type TokenPayload } from '@/lib/auth/jwt-verifier';

const PUBLIC_ROUTES = ['/', '/cars', '/login', '/register', '/callback'];
const AUTH_ROUTES = ['/login', '/register', '/callback'];
const ADMIN_ROUTES = ['/admin', '/dashboard'];
const PROTECTED_ROUTES = ['/rentals', '/profile', '/settings'];

function isPublicRoute(pathname: string): boolean {
    if (PUBLIC_ROUTES.includes(pathname)) return true;
    if (pathname.startsWith('/cars/')) return true;
    return pathname.startsWith('/api/');
}

function isAuthRoute(pathname: string): boolean {
    return AUTH_ROUTES.some(route => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
    return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

function redirectToLogin(request: NextRequest, pathname: string): NextResponse {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('access_token')?.value;

    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    let payload: TokenPayload | null = null;
    let isAuthenticated = false;

    if (token) {
        const result = await verifyToken(token);
        if (result.valid && result.payload) {
            payload = result.payload;
            isAuthenticated = true;
        }
    }

    const isAdmin = payload?.roles?.includes('ADMIN') ?? false;

    if (isAuthRoute(pathname) && isAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (isAdminRoute(pathname)) {
        if (!isAuthenticated) {
            return redirectToLogin(request, pathname);
        }

        if (!isAdmin) {
            return NextResponse.redirect(new URL('/forbidden', request.url));
        }

        return NextResponse.next();
    }

    if (isProtectedRoute(pathname) || !isPublicRoute(pathname)) {
        if (!isAuthenticated) {
            return redirectToLogin(request, pathname);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.[\\w]+$).*)',
    ],
};

