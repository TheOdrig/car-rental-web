export type RouteAccess = 'public' | 'guest-only' | 'auth-flow' | 'protected' | 'admin' | 'admin-api';

const ADMIN_PAGE_ROUTES = ['/admin'];
const ADMIN_API_ROUTES = ['/api/admin'];
const GUEST_ONLY_ROUTES = ['/login', '/register', '/forgot-password'];
const AUTH_FLOW_ROUTES = ['/callback', '/reset-password'];
const PUBLIC_ROUTES = ['/about', '/locations', '/search', '/cars', '/forbidden', '/api'];

function matches(pathname: string, route: string): boolean {
    return pathname === route || pathname.startsWith(`${route}/`);
}

function matchesAny(pathname: string, routes: string[]): boolean {
    return routes.some((route) => matches(pathname, route));
}

export function classifyRoute(pathname: string): RouteAccess {
    if (pathname === '/') return 'public';
    if (matchesAny(pathname, ADMIN_API_ROUTES)) return 'admin-api';
    if (matchesAny(pathname, ADMIN_PAGE_ROUTES)) return 'admin';
    if (matchesAny(pathname, GUEST_ONLY_ROUTES)) return 'guest-only';
    if (matchesAny(pathname, AUTH_FLOW_ROUTES)) return 'auth-flow';
    if (matchesAny(pathname, PUBLIC_ROUTES)) return 'public';
    return 'protected';
}
