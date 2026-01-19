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
        const damageId = parseInt(id, 10);

        if (isNaN(damageId)) {
            return NextResponse.json(
                { error: 'Invalid damage ID' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const data = await routePost(
            endpoints.damages.dispute(damageId),
            body,
            { cache: 'no-store' }
        );
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('[API] POST /api/damages/[id]/dispute error:', error);
        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }
        return NextResponse.json(
            { error: 'Failed to submit dispute' },
            { status: 500 }
        );
    }
}
