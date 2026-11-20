import { ROUTES } from '@/shared/config/routes';

export type RouteAccess = 'public' | 'guest-only' | 'auth-flow' | 'protected' | 'admin' | 'admin-api';

const ADMIN_PAGE_ROUTES = [ROUTES.admin.root];
const ADMIN_API_ROUTES = ['/api/admin'];
const GUEST_ONLY_ROUTES = [ROUTES.login, ROUTES.register, ROUTES.forgotPassword];
const AUTH_FLOW_ROUTES = [ROUTES.resetPassword];
const PROTECTED_ROUTES = [ROUTES.rentals.list, ROUTES.damages.list, ROUTES.settings.root, ROUTES.dashboard, ROUTES.checkout, ROUTES.booking.root];
const PUBLIC_ROUTES = [ROUTES.search, ROUTES.cars.list, ROUTES.forbidden, '/api', ROUTES.terms, ROUTES.privacy];
const CHROMELESS_ROUTES = [ROUTES.login, ROUTES.register, ROUTES.forgotPassword, ROUTES.resetPassword, ROUTES.admin.root];

function matches(pathname: string, route: string): boolean {
    return pathname === route || pathname.startsWith(`${route}/`);
}

function matchesAny(pathname: string, routes: string[]): boolean {
    return routes.some((route) => matches(pathname, route));
}

export function isChromelessRoute(pathname: string | null | undefined): boolean {
    return !!pathname && matchesAny(pathname, CHROMELESS_ROUTES);
}

export function classifyRoute(pathname: string): RouteAccess {
    if (pathname === ROUTES.home) return 'public';
    if (matchesAny(pathname, ADMIN_API_ROUTES)) return 'admin-api';
    if (matchesAny(pathname, ADMIN_PAGE_ROUTES)) return 'admin';
    if (matchesAny(pathname, GUEST_ONLY_ROUTES)) return 'guest-only';
    if (matchesAny(pathname, AUTH_FLOW_ROUTES)) return 'auth-flow';
    if (matchesAny(pathname, PUBLIC_ROUTES)) return 'public';
    if (matchesAny(pathname, PROTECTED_ROUTES)) return 'protected';
    return 'public';
}
