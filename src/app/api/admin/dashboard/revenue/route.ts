import { NextResponse } from 'next/server';
import { routeGet } from '@/shared/api/route-handler';
import { endpoints } from '@/shared/api';
import { isApiError } from '@/shared/api';
import type { RevenueAnalytics } from '@/features/admin';

export async function GET() {
    try {
        const data = await routeGet<RevenueAnalytics>(endpoints.admin.dashboard.revenue, {
            cache: 'no-store',
            tags: ['admin', 'dashboard', 'revenue'],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/dashboard/revenue error:', error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch revenue analytics' },
            { status: 503 }
        );
    }
}
