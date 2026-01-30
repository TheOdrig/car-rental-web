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
        const targetUrl = endpoints.admin.quickActions.reject(rentalId);
        console.log('[API] Reject rental - calling backend URL:', targetUrl);

        const result = await routePost<QuickActionResult>(
            targetUrl,
            body,
            { cache: 'no-store' }
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error(`[API] POST /api/admin/rentals/${id}/reject error:`, error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to reject rental' },
            { status: 503 }
        );
    }
}
