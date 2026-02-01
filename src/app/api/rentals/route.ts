import { NextRequest, NextResponse } from 'next/server';
import { serverGet, serverPost } from '@/shared/api/server';
import { isApiError } from '@/shared/api';
import { RENTAL_ENDPOINTS, type Rental, type RentalRequest } from '@/entities/rental';
import type { PageResponse } from '@/shared/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const backendUrl = new URL(RENTAL_ENDPOINTS.list);
        searchParams.forEach((value, key) => {
            backendUrl.searchParams.append(key, value);
        });

        const data = await serverGet<PageResponse<Rental>>(backendUrl.toString(), {
            cache: 'no-store',
            tags: ['rentals'],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/rentals error:', error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch rentals' },
            { status: 503 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: RentalRequest = await request.json();

        const rental = await serverPost<Rental>(RENTAL_ENDPOINTS.request, body, {
            cache: 'no-store',
        });

        return NextResponse.json(rental, { status: 201 });
    } catch (error) {
        console.error('[API] POST /api/rentals error:', error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create rental request' },
            { status: 503 }
        );
    }
}