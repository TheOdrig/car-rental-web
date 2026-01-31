import { NextRequest, NextResponse } from 'next/server';
import { serverGet, serverPost } from '@/shared/api/server';
import { isApiError } from '@/shared/api';
import { RENTAL_ENDPOINTS, type Rental } from '@/entities/rental';

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
        const rental = await serverGet<Rental>(RENTAL_ENDPOINTS.byId(rentalId), {
            cache: 'no-store',
            tags: ['rentals', `rental-${rentalId}`],
        });

        return NextResponse.json(rental);
    } catch (error) {
        console.error(`[API] GET /api/rentals/${id} error:`, error);

        if (isApiError(error)) {
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
        const rental = await serverPost<Rental>(RENTAL_ENDPOINTS.cancel(rentalId), undefined, {
            cache: 'no-store',
        });

        return NextResponse.json(rental);
    } catch (error) {
        console.error(`[API] DELETE /api/rentals/${id} error:`, error);

        if (isApiError(error)) {
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
