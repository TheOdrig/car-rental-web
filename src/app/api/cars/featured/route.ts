import { NextRequest, NextResponse } from 'next/server';
import { serverGet } from '@/shared/api/server';
import { endpoints } from '@/shared/api';
import { isApiError } from '@/shared/api';
import type { Car } from '@/entities/car';
import type { PageResponse } from '@/shared/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const backendUrl = new URL(endpoints.cars.featured);
        searchParams.forEach((value, key) => {
            backendUrl.searchParams.append(key, value);
        });

        const data = await serverGet<PageResponse<Car>>(backendUrl.toString(), {
            cache: 'no-store',
            tags: ['cars', 'featured'],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/cars/featured error:', error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch featured cars' },
            { status: 503 }
        );
    }
}
