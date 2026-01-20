import { NextRequest, NextResponse } from 'next/server';
import { routePost } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';
import type { PenaltyWaiverResponse } from '@/types';

export async function POST(
    request: NextRequest,
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

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }

    try {
        const result = await routePost<PenaltyWaiverResponse>(
            endpoints.admin.penaltyWaive(rentalId),
            body,
            { cache: 'no-store' }
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error(`[API] POST /api/admin/rentals/${id}/penalty/waive error:`, error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to waive penalty' },
            { status: 503 }
        );
    }
}
