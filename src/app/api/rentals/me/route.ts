import { NextRequest, NextResponse } from 'next/server';
import { serverGet } from '@/shared/api/server';
import { isApiError } from '@/shared/api';
import { RENTAL_ENDPOINTS, type Rental } from '@/entities/rental';
import type { PageResponse } from '@/shared/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const backendUrl = new URL(RENTAL_ENDPOINTS.me);
        searchParams.forEach((value, key) => {
            backendUrl.searchParams.append(key, value);
        });

        const data = await serverGet<PageResponse<Rental>>(backendUrl.toString(), {
            cache: 'no-store',
            tags: ['rentals', 'my-rentals'],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/rentals/me error:', error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch your rentals' },
            { status: 503 }
        );
    }
}