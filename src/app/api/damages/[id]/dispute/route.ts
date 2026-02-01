import { NextRequest, NextResponse } from 'next/server';
import { routePost } from '@/shared/api/route-handler';
import { isApiError } from '@/shared/api';
import { DAMAGE_ENDPOINTS } from '@/entities/damage';

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
            DAMAGE_ENDPOINTS.dispute(damageId),
            body,
            { cache: 'no-store' }
        );
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('[API] POST /api/damages/[id]/dispute error:', error);
        if (isApiError(error)) {
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