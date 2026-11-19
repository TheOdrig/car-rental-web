import 'server-only';

export { getServerEnv, parseServerEnv, type ServerEnv } from './env';
export {
    ACCESS_COOKIE,
    REFRESH_COOKIE,
    buildAuthCookies,
    mergeCookieHeader,
    clearAuthTokens,
    getAccessToken,
    getRefreshToken,
    resolveAccessMaxAge,
    setAuthTokens,
    type AuthTokens,
} from './auth-cookies';
export {
    CLIENT_IP_HEADER,
    clientIpFromRequestHeaders,
    clientIpHeaders,
    currentClientIp,
    resolveClientIp,
    type ClientIpRule,
} from './client-ip';
export { isAdminSession, verifyAccessToken, type Session } from './session';
export {
    authResponseSchema,
    buildUpstreamUrl,
    forgetRefresh,
    refreshAuthSession,
    refreshAuthTokens,
    renewAccessToken,
    upstream,
    upstreamFetch,
    upstreamResponse,
    type AuthResponse,
    type RefreshOutcome,
    type UpstreamOptions,
} from './upstream';
export {
    API,
    listUpstreamEndpoints,
    type UpstreamEndpoint,
    type UpstreamMethod,
    type UpstreamTarget,
} from './upstream-endpoints';
export { created, errorResponse, parseIdParam, proxy, readJson, route, searchParamsOf } from './route';
export { getSession, signIn } from './auth-session';
