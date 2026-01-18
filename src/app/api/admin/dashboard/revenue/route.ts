import { NextResponse } from 'next/server';
import { routeGet } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';
import type { RevenueAnalytics } from '@/types';

export async function GET() {
    try {
        const data = await routeGet<RevenueAnalytics>(endpoints.admin.dashboard.revenue, {
            cache: 'no-store',
            tags: ['admin', 'dashboard', 'revenue'],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/dashboard/revenue error:', error);

        if (isApiException(error)) {
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
