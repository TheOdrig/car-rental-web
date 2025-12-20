import { NextResponse } from 'next/server';
import { endpoints } from '@/lib/api';
import { getRefreshToken, setAuthTokens, clearAuthTokens } from '@/lib/auth';
import { AuthResponse } from '@/types';

export async function POST() {
    try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
            return NextResponse.json(
                { message: 'No refresh token' },
                { status: 401 }
            );
        }

        const response = await fetch(endpoints.auth.refresh, {
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
