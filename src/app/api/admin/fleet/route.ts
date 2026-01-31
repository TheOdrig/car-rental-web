import { NextResponse } from 'next/server';
import { routeGet } from '@/shared/api/route-handler';
import { isApiError } from '@/shared/api';
import { ADMIN_ENDPOINTS, type FleetStatus } from '@/features/admin';

export async function GET() {
    try {
        const data = await routeGet<FleetStatus>(ADMIN_ENDPOINTS.dashboard.fleet, {
            cache: 'no-store',
            tags: ['admin', 'fleet'],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/fleet error:', error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch fleet status' },
            { status: 503 }
        );
    }
}