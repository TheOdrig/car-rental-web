import { NextRequest, NextResponse } from 'next/server';
import { routePost } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';

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

        await routePost(endpoints.admin.users.unban(userId), body);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] POST /api/admin/users/[id]/unban error:', error);

        if (isApiException(error)) {
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
