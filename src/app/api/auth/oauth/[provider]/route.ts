import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/shared/lib/logger';
import { API, buildUpstreamUrl } from '@/shared/server';
import { isOAuthProvider } from '../../_lib/oauth-providers';
import { setOAuthStateCookie } from '../../_lib/oauth-state';

interface RouteParams {
    params: Promise<{ provider: string }>;
}

function loginRedirect(request: NextRequest, error: string): NextResponse {
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { provider } = await params;

    if (!isOAuthProvider(provider)) {
        return loginRedirect(request, 'unsupported_provider');
    }

    try {
        const response = await fetch(buildUpstreamUrl(API.oauth.authorize.resolve({ provider }).path), {
            redirect: 'manual',
            cache: 'no-store',
        });
        const location = response.headers.get('location');

        if (response.status < 300 || response.status >= 400 || !location) {
            return loginRedirect(request, 'oauth_unavailable');
        }

        const target = new URL(location);

        const state = target.searchParams.get('state');

        if (target.protocol !== 'https:' || !state) {
            return loginRedirect(request, 'oauth_unavailable');
        }

        const redirect = NextResponse.redirect(target);
        setOAuthStateCookie(redirect, state);

        return redirect;
    } catch (error) {
        logger.error('[BFF] OAuth start failed', error);
        return loginRedirect(request, 'oauth_unavailable');
    }
}
