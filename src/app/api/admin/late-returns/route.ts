import { NextRequest, NextResponse } from 'next/server';
import { routeGet } from '@/shared/api/route-handler';
import { endpoints } from '@/shared/api';
import { isApiError } from '@/shared/api';
import type { PaginatedLateReturns } from '@/entities/rental';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const queryString = searchParams.toString();
    const url = queryString
        ? `${endpoints.admin.lateReturns}?${queryString}`
        : endpoints.admin.lateReturns;

    try {
        const result = await routeGet<PaginatedLateReturns>(url, {
            cache: 'no-store',
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('[API] GET /api/admin/late-returns error:', error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch late returns' },
            { status: 503 }
        );
    }
}
