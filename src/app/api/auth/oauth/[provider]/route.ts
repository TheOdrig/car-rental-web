import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_ENDPOINTS } from '@/features/auth';
import { logger } from '@/shared/lib/logger';
import { buildUpstreamUrl } from '@/shared/server';
import { isOAuthProvider } from '../../_lib/oauth-providers';

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
        const response = await fetch(buildUpstreamUrl(AUTH_ENDPOINTS.oauth.authorize(provider)), {
            redirect: 'manual',
            cache: 'no-store',
        });
        const location = response.headers.get('location');

        if (response.status < 300 || response.status >= 400 || !location) {
            return loginRedirect(request, 'oauth_unavailable');
        }

        const target = new URL(location);

        if (target.protocol !== 'https:') {
            return loginRedirect(request, 'oauth_unavailable');
        }

        return NextResponse.redirect(target);
    } catch (error) {
        logger.error('[BFF] OAuth start failed', error);
        return loginRedirect(request, 'oauth_unavailable');
    }
}
