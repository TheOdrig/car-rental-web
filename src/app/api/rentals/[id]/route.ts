import { NextRequest, NextResponse } from 'next/server';
import { serverGet, serverPost } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';
import type { Rental } from '@/types';

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
        const rental = await serverGet<Rental>(endpoints.rentals.byId(rentalId), {
            cache: 'no-store',
            tags: ['rentals', `rental-${rentalId}`],
        });

        return NextResponse.json(rental);
    } catch (error) {
        console.error(`[API] GET /api/rentals/${id} error:`, error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch rental' },
            { status: 503 }
        );
    }
}

export async function DELETE(
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
        const rental = await serverPost<Rental>(endpoints.rentals.cancel(rentalId), undefined, {
            cache: 'no-store',
        });

        return NextResponse.json(rental);
    } catch (error) {
        console.error(`[API] DELETE /api/rentals/${id} error:`, error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to cancel rental' },
            { status: 503 }
        );
    }
}
