import { NextResponse } from 'next/server';
import { AUTH_ENDPOINTS, getRefreshToken, setAuthTokens, clearAuthTokens } from '@/features/auth';
import { AuthResponse } from '@/features/auth';

export async function POST() {
    try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
            return NextResponse.json(
                { message: 'No refresh token' },
                { status: 401 }
            );
        }

        const response = await fetch(AUTH_ENDPOINTS.refresh, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            await clearAuthTokens();
            return NextResponse.json(
                { message: 'Token refresh failed' },
                { status: 401 }
            );
        }

        const data: AuthResponse = await response.json();

        await setAuthTokens(data.accessToken, data.refreshToken, data.expiresIn);

        return NextResponse.json({
            username: data.username,
            tokenType: data.tokenType,
        });
    } catch (error) {
        console.error('Refresh error:', error);
        await clearAuthTokens();
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}