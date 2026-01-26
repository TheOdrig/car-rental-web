import { NextResponse } from 'next/server';
import { routeGet } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';
import type { DailySummary } from '@/types';

export async function GET() {
    try {
        const data = await routeGet<DailySummary>(endpoints.admin.dashboard.summary, {
            cache: 'no-store',
            tags: ['admin', 'dashboard', 'summary'],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/dashboard error:', error);

        if (isApiException(error)) {
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

