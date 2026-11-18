import { NextResponse, type NextRequest } from 'next/server';
import { isApiError } from '@/shared/api';
import { logger } from '@/shared/lib/logger';
import { API, authResponseSchema, searchParamsOf, setAuthTokens, upstream } from '@/shared/server';
import { isOAuthProvider } from '../../_lib/oauth-providers';
import { OAUTH_STATE_COOKIE, clearOAuthStateCookie, oauthStateMatches } from '../../_lib/oauth-state';

interface RouteParams {
    params: Promise<{ provider: string }>;
}

function finish(response: NextResponse): NextResponse {
    clearOAuthStateCookie(response);
    return response;
}

function loginRedirect(request: NextRequest, error: string): NextResponse {
    return finish(NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url)));
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

        return finish(NextResponse.redirect(new URL('/', request.url)));
    } catch (error) {
        logger.error('[BFF] OAuth callback failed', error);
        return loginRedirect(request, isApiError(error) && error.message ? error.message : 'callback_failed');
    }
}
