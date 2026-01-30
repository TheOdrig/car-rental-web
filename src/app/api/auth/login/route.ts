import { NextRequest, NextResponse } from 'next/server';
import { endpoints } from '@/shared/api';
import { setAuthTokens } from '@/features/auth';
import { LoginRequest, AuthResponse } from '@/features/auth';

export async function POST(request: NextRequest) {
    try {
        const body: LoginRequest = await request.json();

        const response = await fetch(endpoints.auth.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(error, { status: response.status });
        }

        const data: AuthResponse = await response.json();

        await setAuthTokens(data.accessToken, data.refreshToken, data.expiresIn);

        return NextResponse.json({
            username: data.username,
            tokenType: data.tokenType,
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
