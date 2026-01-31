import { NextResponse } from 'next/server';
import { getAccessToken, getRefreshToken, setAuthTokens, clearAuthTokens } from '@/features/auth';
import { endpoints } from '@/shared/api';
import type { AuthResponse } from '@/features/auth';

export async function GET() {
    try {
        let token = await getAccessToken();

        if (!token) {
            const refreshToken = await getRefreshToken();

            if (!refreshToken) {
                return NextResponse.json(
                    { message: 'Not authenticated' },
                    { status: 401 }
                );
            }

            try {
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
                token = data.accessToken;
            } catch {
                await clearAuthTokens();
                return NextResponse.json(
                    { message: 'Token refresh failed' },
                    { status: 401 }
                );
            }
        }

        if (!token) {
            return NextResponse.json(
                { message: 'Authentication failed' },
                { status: 401 }
            );
        }

        const payload = JSON.parse(atob(token.split('.')[1]));

        return NextResponse.json({
            id: payload.userId,
            username: payload.sub,
            roles: payload.roles || [],
            exp: payload.exp,
        });
    } catch (error) {
        console.error('Me error:', error);
        return NextResponse.json(
            { message: 'Invalid token' },
            { status: 401 }
        );
    }
}
