import { NextResponse } from 'next/server';
import { serverPost } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';
import type { ForgotPasswordRequest, MessageResponse } from '@/types';

export async function POST(request: Request) {
    try {
        const body: ForgotPasswordRequest = await request.json();

        const data = await serverPost<MessageResponse>(endpoints.auth.forgotPassword, body);

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] POST /api/auth/forgot-password error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to send password reset email' },
            { status: 503 }
        );
    }
}
