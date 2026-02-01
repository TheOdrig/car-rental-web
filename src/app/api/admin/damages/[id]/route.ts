import { NextRequest, NextResponse } from 'next/server';
import { routeGet } from '@/shared/api/route-handler';
import { isApiError } from '@/shared/api';
import { DAMAGE_ENDPOINTS } from '@/entities/damage';

export async function GET(
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

        const data = await routeGet(DAMAGE_ENDPOINTS.admin.byId(damageId), {
            cache: 'no-store',
        });
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/damages/[id] error:', error);
        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }
        return NextResponse.json(
            { error: 'Failed to fetch damage detail' },
            { status: 500 }
        );
    }
}