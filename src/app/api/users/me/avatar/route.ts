import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/features/auth';
import { USER_ENDPOINTS, type AvatarUploadResponse } from '@/entities/user';

export async function POST(request: NextRequest) {
    try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();

        const response = await fetch(USER_ENDPOINTS.avatar, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to upload avatar' }));
            return NextResponse.json(error, { status: response.status });
        }

        const data: AvatarUploadResponse = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] POST /api/users/me/avatar error:', error);
        const message = error instanceof Error ? error.message : 'Failed to upload avatar';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch(USER_ENDPOINTS.avatar, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to delete avatar' }));
            return NextResponse.json(error, { status: response.status });
        }

        const data: AvatarUploadResponse = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] DELETE /api/users/me/avatar error:', error);
        const message = error instanceof Error ? error.message : 'Failed to delete avatar';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';