import { NextRequest, NextResponse } from 'next/server';
import { routePost } from '@/shared/api/route-handler';
import { isApiError } from '@/shared/api';
import { ADMIN_ENDPOINTS } from '@/features/admin';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = parseInt(id, 10);

        if (isNaN(userId)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        let body = {};
        try {
            body = await request.json();
        } catch {
        }

        await routePost(ADMIN_ENDPOINTS.users.unban(userId), body);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] POST /api/admin/users/[id]/unban error:', error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to unban user' },
            { status: 503 }
        );
    }
}
