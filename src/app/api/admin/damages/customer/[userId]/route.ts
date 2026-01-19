import { NextRequest, NextResponse } from 'next/server';
import { routeGet } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';

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
            ? `${endpoints.damages.admin.customerHistory(userIdNum)}?${queryString}`
            : endpoints.damages.admin.customerHistory(userIdNum);

        const data = await routeGet(url, {
            cache: 'no-store',
        });
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/damages/customer/[userId] error:', error);
        if (isApiException(error)) {
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
