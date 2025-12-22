import { NextResponse, type NextRequest } from 'next/server';

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

interface JwtPayload {
    sub: string;
    userId: number;
    roles: string[];
    exp: number;
}

function decodeToken(token: string): JwtPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(atob(parts[1]));
        return payload as JwtPayload;
    } catch {
        return null;
    }
}

function isTokenExpired(payload: JwtPayload): boolean {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('access_token')?.value;

    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    const payload = token ? decodeToken(token) : null;
    const isAuthenticated = payload && !isTokenExpired(payload);
    const isAdmin = payload?.roles?.includes('ADMIN') ?? false;

    if (isAuthRoute(pathname) && isAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (isAdminRoute(pathname)) {
        if (!isAuthenticated) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        if (!isAdmin) {
            return NextResponse.redirect(new URL('/forbidden', request.url));
        }

        return NextResponse.next();
    }

    if (isProtectedRoute(pathname) || !isPublicRoute(pathname)) {
        if (!isAuthenticated) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.[\\w]+$).*)',
    ],
};
