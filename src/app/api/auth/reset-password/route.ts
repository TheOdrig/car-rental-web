import { NextResponse } from 'next/server';
import { serverPost } from '@/shared/api/server';
import { endpoints } from '@/shared/api';
import { isApiError } from '@/shared/api';
import type { ResetPasswordRequest, MessageResponse } from '@/features/auth';

export async function POST(request: Request) {
    try {
        const body: ResetPasswordRequest = await request.json();

        const data = await serverPost<MessageResponse>(endpoints.auth.resetPassword, body);

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] POST /api/auth/reset-password error:', error);

        if (isApiError(error)) {
            const message = error.message.toLowerCase();

            if (message.includes('expired')) {
                return NextResponse.json(
                    { error: 'This password reset link has expired. Please request a new one.' },
                    { status: 400 }
                );
            }

            if (message.includes('invalid') || message.includes('used')) {
                return NextResponse.json(
                    { error: 'This password reset link is invalid or has already been used.' },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to reset password' },
            { status: 503 }
        );
    }
}
