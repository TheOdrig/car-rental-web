import { NextRequest, NextResponse } from 'next/server';
import { serverPost } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';
import type { QuickActionResult } from '@/types';

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
        const result = await serverPost<QuickActionResult>(
            endpoints.admin.quickActions.approve(rentalId),
            body,
            { cache: 'no-store' }
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error(`[API] POST /api/admin/rentals/${id}/approve error:`, error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to approve rental' },
            { status: 503 }
        );
    }
}
