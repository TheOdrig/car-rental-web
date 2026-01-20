import { NextRequest, NextResponse } from 'next/server';
import { routeGet } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';
import type { LateReturnStatistics } from '@/types';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryString = searchParams.toString();
    const url = queryString
        ? `${endpoints.admin.lateReturnStatistics}?${queryString}`
        : endpoints.admin.lateReturnStatistics;

    try {
        const result = await routeGet<LateReturnStatistics>(url, {
            cache: 'no-store',
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('[API] GET /api/admin/late-returns/statistics error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch late return statistics' },
            { status: 503 }
        );
    }
}
