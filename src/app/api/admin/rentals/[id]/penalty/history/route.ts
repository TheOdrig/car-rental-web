import { NextRequest, NextResponse } from 'next/server';
import { routeGet } from '@/shared/api/route-handler';
import { isApiError } from '@/shared/api';
import { ADMIN_ENDPOINTS } from '@/features/admin';
import type { PenaltyWaiverResponse } from '@/entities/rental';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const rentalId = parseInt(id, 10);

    if (isNaN(rentalId)) {
        return NextResponse.json(
            { error: 'Invalid rental ID' },
            { status: 400 }
        );
    }

    try {
        const result = await routeGet<PenaltyWaiverResponse[]>(
            ADMIN_ENDPOINTS.penaltyHistory(rentalId),
            { cache: 'no-store' }
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error(`[API] GET /api/admin/rentals/${id}/penalty/history error:`, error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch penalty history' },
            { status: 503 }
        );
    }
}
