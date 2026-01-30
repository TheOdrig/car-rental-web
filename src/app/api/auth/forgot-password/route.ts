import { NextResponse } from 'next/server';
import { serverPost } from '@/shared/api/server';
import { endpoints } from '@/shared/api';
import { isApiError } from '@/shared/api';
import type { ForgotPasswordRequest, MessageResponse } from '@/features/auth';

export async function POST(request: Request) {
    try {
        const body: ForgotPasswordRequest = await request.json();

        const data = await serverPost<MessageResponse>(endpoints.auth.forgotPassword, body);

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] POST /api/auth/forgot-password error:', error);

        if (isApiError(error)) {
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
