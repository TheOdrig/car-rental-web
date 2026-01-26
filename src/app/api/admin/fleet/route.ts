import { NextResponse } from 'next/server';
import { routeGet } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';
import type { FleetStatus } from '@/types';

export async function GET() {
    try {
        const data = await routeGet<FleetStatus>(endpoints.admin.dashboard.fleet, {
            cache: 'no-store',
            tags: ['admin', 'fleet'],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/fleet error:', error);

        if (isApiException(error)) {
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

