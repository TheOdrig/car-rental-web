import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/shared/lib/logger';
import { ROUTES } from '@/shared/config/routes';
import { safeRedirectPath } from '@/shared/lib/safe-redirect';
import { API, buildUpstreamUrl, clientIpHeaders, getServerEnv } from '@/shared/server';
import { oauthProblemRedirectCode } from '../../_lib/oauth-errors';
import { isOAuthProvider } from '../../_lib/oauth-providers';
import { setOAuthNextCookie, setOAuthStateCookie } from '../../_lib/oauth-state';

interface RouteParams {
    params: Promise<{ provider: string }>;
}

function loginRedirect(request: NextRequest, error: string): NextResponse {
    return NextResponse.redirect(new URL(ROUTES.loginWithError(error), request.url));
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { provider } = await params;

    if (!isOAuthProvider(provider)) {
        return loginRedirect(request, 'unsupported_provider');
    }

    try {
        const response = await fetch(buildUpstreamUrl(API.oauth.authorize.resolve({ provider }).path), {
            redirect: 'manual',
            headers: await clientIpHeaders(),
            cache: 'no-store',
            signal: AbortSignal.timeout(getServerEnv().API_TIMEOUT_MS),
        });
        const location = response.headers.get('location');

        if (response.status < 300 || response.status >= 400 || !location) {
            const problem = await response.json().catch(() => null);
            return loginRedirect(request, oauthProblemRedirectCode(problem) ?? 'oauth_unavailable');
        }

        const target = new URL(location);

        const state = target.searchParams.get('state');

        if (target.protocol !== 'https:' || !state) {
            return loginRedirect(request, 'oauth_unavailable');
        }

        const redirect = NextResponse.redirect(target);
        setOAuthStateCookie(redirect, state);

        const next = safeRedirectPath(request.nextUrl.searchParams.get('callbackUrl'));
        if (next !== '/') {
            setOAuthNextCookie(redirect, next);
        }

        return redirect;
    } catch (error) {
        logger.error('[BFF] OAuth start failed', error);
        return loginRedirect(request, 'oauth_unavailable');
    }
}
