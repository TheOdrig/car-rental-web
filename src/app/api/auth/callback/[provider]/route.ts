import { NextRequest, NextResponse } from 'next/server';
import { endpoints } from '@/lib/api';
import { setAuthTokens } from '@/lib/auth';
import { AuthResponse } from '@/types';

interface RouteParams {
    params: Promise<{ provider: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { provider } = await params;
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
            return NextResponse.redirect(
                new URL('/login?error=invalid_callback', request.url)
            );
        }

        const callbackUrl = `${endpoints.auth.oauth.callback(provider)}?code=${code}&state=${state}`;

        const response = await fetch(callbackUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            const errorMessage = error.message || 'oauth_failed';
            return NextResponse.redirect(
                new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url)
            );
        }

        const data: AuthResponse = await response.json();

        await setAuthTokens(data.accessToken, data.refreshToken, data.expiresIn);

        return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.redirect(
            new URL('/login?error=callback_failed', request.url)
        );
    }
}
