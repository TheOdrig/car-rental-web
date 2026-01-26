import { NextResponse } from 'next/server';
import { serverGet, serverPut } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';
import type { UserProfile, ProfileUpdateData } from '@/types';

export async function GET() {
    try {
        const data = await serverGet<UserProfile>(endpoints.users.profile, {
            cache: 'no-store',
        });
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/users/me/profile error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 503 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const body: ProfileUpdateData = await request.json();

        const data = await serverPut<UserProfile>(endpoints.users.profile, body);

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] PUT /api/users/me/profile error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 503 }
        );
    }
}

