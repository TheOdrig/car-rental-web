import { NextRequest, NextResponse } from 'next/server';
import { routeGet } from '@/shared/api/route-handler';
import { isApiError } from '@/shared/api';
import { ADMIN_ENDPOINTS } from '@/features/admin';
import type { LateReturnStatistics } from '@/entities/rental';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryString = searchParams.toString();
    const url = queryString
        ? `${ADMIN_ENDPOINTS.lateReturnStatistics}?${queryString}`
        : ADMIN_ENDPOINTS.lateReturnStatistics;

    try {
        const result = await routeGet<LateReturnStatistics>(url, {
            cache: 'no-store',
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('[API] GET /api/admin/late-returns/statistics error:', error);

        if (isApiError(error)) {
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