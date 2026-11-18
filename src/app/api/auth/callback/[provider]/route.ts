import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_ENDPOINTS } from '@/features/auth';
import { isApiError } from '@/shared/api';
import { logger } from '@/shared/lib/logger';
import { authResponseSchema, searchParamsOf, setAuthTokens, upstream } from '@/shared/server';
import { isOAuthProvider } from '../../_lib/oauth-providers';

interface RouteParams {
    params: Promise<{ provider: string }>;
}

function loginRedirect(request: NextRequest, error: string): NextResponse {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url));
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { provider } = await params;
    const searchParams = searchParamsOf(request);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!isOAuthProvider(provider) || !code || !state) {
        return loginRedirect(request, 'invalid_callback');
    }

    try {
        const data = await upstream.get<unknown>(AUTH_ENDPOINTS.oauth.callback(provider), {
            params: { code, state },
            anonymous: true,
            cache: 'no-store',
        });
        const tokens = authResponseSchema.safeParse(data);

        if (!tokens.success) {
            return loginRedirect(request, 'oauth_failed');
        }

        await setAuthTokens(tokens.data);

        return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
        logger.error('[BFF] OAuth callback failed', error);
        return loginRedirect(request, isApiError(error) && error.message ? error.message : 'callback_failed');
    }
}
