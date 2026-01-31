import { NextResponse } from 'next/server';
import { routeGet } from '@/shared/api/route-handler';
import { isApiError } from '@/shared/api';
import { ADMIN_ENDPOINTS, type DailySummary } from '@/features/admin';

export async function GET() {
    try {
        const data = await routeGet<DailySummary>(ADMIN_ENDPOINTS.dashboard.summary, {
            cache: 'no-store',
            tags: ['admin', 'dashboard', 'summary'],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/dashboard error:', error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch dashboard summary' },
            { status: 503 }
        );
    }
}
