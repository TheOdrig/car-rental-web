import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/shared/lib/logger';
import { ROUTES } from '@/shared/config/routes';
import { safeRedirectPath } from '@/shared/lib/safe-redirect';
import { API, authResponseSchema, searchParamsOf, setAuthTokens, upstream } from '@/shared/server';
import { isOAuthProvider } from '../../_lib/oauth-providers';
import { oauthRedirectCode } from '../../_lib/oauth-errors';
import {
    OAUTH_NEXT_COOKIE,
    OAUTH_STATE_COOKIE,
    clearOAuthNextCookie,
    clearOAuthStateCookie,
    oauthStateMatches,
} from '../../_lib/oauth-state';

interface RouteParams {
    params: Promise<{ provider: string }>;
}

function finish(response: NextResponse): NextResponse {
    clearOAuthStateCookie(response);
    clearOAuthNextCookie(response);
    return response;
}

function loginRedirect(request: NextRequest, error: string): NextResponse {
    return finish(NextResponse.redirect(new URL(ROUTES.loginWithError(encodeURIComponent(error)), request.url)));
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { provider } = await params;
    const searchParams = searchParamsOf(request);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!isOAuthProvider(provider) || !code || !state) {
        return loginRedirect(request, 'invalid_callback');
    }

    if (!oauthStateMatches(request.cookies.get(OAUTH_STATE_COOKIE)?.value, state)) {
        return loginRedirect(request, 'invalid_state');
    }

    try {
        const data = await upstream.get<unknown>(API.oauth.callback.resolve({ provider }), {
            params: { code, state },
            anonymous: true,
            cache: 'no-store',
        });
        const tokens = authResponseSchema.safeParse(data);

        if (!tokens.success) {
            return loginRedirect(request, 'oauth_failed');
        }

        await setAuthTokens(tokens.data);

        const next = safeRedirectPath(request.cookies.get(OAUTH_NEXT_COOKIE)?.value);

        return finish(NextResponse.redirect(new URL(next, request.url)));
    } catch (error) {
        logger.error('[BFF] OAuth callback failed', error);
        return loginRedirect(request, oauthRedirectCode(error));
    }
}
