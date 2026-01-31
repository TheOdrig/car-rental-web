import { NextResponse } from 'next/server';
import { serverPost } from '@/shared/api/server';
import { isApiError } from '@/shared/api';
import { USER_ENDPOINTS, type PasswordChangeData } from '@/entities/user';
import type { MessageResponse } from '@/shared/types';

export async function POST(request: Request) {
    try {
        const body: PasswordChangeData = await request.json();

        const data = await serverPost<MessageResponse>(USER_ENDPOINTS.password, body);

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] POST /api/users/me/password error:', error);

        if (isApiError(error)) {
            const message = error.message.toLowerCase();

            if (message.includes('current password') ||
                message.includes('incorrect') ||
                message.includes('invalid password')) {
                return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to change password' },
            { status: 503 }
        );
    }
}