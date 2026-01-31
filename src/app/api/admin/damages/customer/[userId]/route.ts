import { NextRequest, NextResponse } from 'next/server';
import { routeGet } from '@/shared/api/route-handler';
import { isApiError } from '@/shared/api';
import { DAMAGE_ENDPOINTS } from '@/entities/damage';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const userIdNum = parseInt(userId, 10);

        if (isNaN(userIdNum)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(request.url);
        const queryString = searchParams.toString();
        const url = queryString
            ? `${DAMAGE_ENDPOINTS.admin.byCustomer(userIdNum)}?${queryString}`
            : DAMAGE_ENDPOINTS.admin.byCustomer(userIdNum);

        const data = await routeGet(url, {
            cache: 'no-store',
        });
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/damages/customer/[userId] error:', error);
        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }
        return NextResponse.json(
            { error: 'Failed to fetch customer damage history' },
            { status: 500 }
        );
    }
}
