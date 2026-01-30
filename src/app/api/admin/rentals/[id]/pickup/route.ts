import { NextRequest, NextResponse } from 'next/server';
import { routePost } from '@/shared/api/route-handler';
import { endpoints } from '@/shared/api';
import { isApiError } from '@/shared/api';
import type { QuickActionResult } from '@/features/admin';

export async function POST(
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

    let body;
    try {
        body = await _request.json();
    } catch {
        body = undefined;
    }

    try {
        const result = await routePost<QuickActionResult>(
            endpoints.admin.quickActions.pickup(rentalId),
            body,
            { cache: 'no-store' }
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error(`[API] POST /api/admin/rentals/${id}/pickup error:`, error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to record pickup' },
            { status: 503 }
        );
    }
}
