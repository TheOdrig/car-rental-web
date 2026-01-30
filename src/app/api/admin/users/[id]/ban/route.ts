import { NextRequest, NextResponse } from 'next/server';
import { routePost } from '@/shared/api/route-handler';
import { endpoints } from '@/shared/api';
import { isApiError } from '@/shared/api';

interface BanRequest {
    reason: string;
}

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

        const body: BanRequest = await request.json();

        await routePost(endpoints.admin.users.ban(userId), body);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] POST /api/admin/users/[id]/ban error:', error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to ban user' },
            { status: 503 }
        );
    }
}
