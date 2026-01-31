import { NextResponse } from 'next/server';
import { serverGet, serverPut } from '@/shared/api/server';
import { isApiError } from '@/shared/api';
import { USER_ENDPOINTS, type UserProfile, type ProfileUpdateData } from '@/entities/user';

export async function GET() {
    try {
        const data = await serverGet<UserProfile>(USER_ENDPOINTS.profile, {
            cache: 'no-store',
        });
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/users/me/profile error:', error);

        if (isApiError(error)) {
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

        const data = await serverPut<UserProfile>(USER_ENDPOINTS.profile, body);

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] PUT /api/users/me/profile error:', error);

        if (isApiError(error)) {
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
