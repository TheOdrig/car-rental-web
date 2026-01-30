import { NextRequest, NextResponse } from 'next/server';
import { routeGet } from '@/shared/api/route-handler';
import { endpoints } from '@/shared/api';
import { isApiError } from '@/shared/api';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const queryString = searchParams.toString();
        const url = queryString
            ? `${endpoints.damages.admin.statistics}?${queryString}`
            : endpoints.damages.admin.statistics;

        const data = await routeGet(url, {
            cache: 'no-store',
        });
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/damages/statistics error:', error);
        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }
        return NextResponse.json(
            { error: 'Failed to fetch damage statistics' },
            { status: 500 }
        );
    }
}
