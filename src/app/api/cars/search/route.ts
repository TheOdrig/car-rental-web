import { NextRequest, NextResponse } from 'next/server';
import { serverPost } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';
import type { AvailabilitySearchRequest, AvailabilitySearchResponse } from '@/types';


export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as AvailabilitySearchRequest;

        console.log('[API] POST /api/cars/search - Request body:', JSON.stringify(body, null, 2));

        if (!body.startDate || !body.endDate) {
            return NextResponse.json(
                { error: 'Start date and end date are required' },
                { status: 400 }
            );
        }

        const start = new Date(body.startDate);
        const end = new Date(body.endDate);
        if (start >= end) {
            return NextResponse.json(
                { error: 'End date must be after start date' },
                { status: 400 }
            );
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (start < today) {
            return NextResponse.json(
                { error: 'Start date cannot be in the past' },
                { status: 400 }
            );
        }

        console.log('[API] Calling backend:', endpoints.cars.availability.search);

        const data = await serverPost<AvailabilitySearchResponse>(
            endpoints.cars.availability.search,
            body
        );

        console.log('[API] Backend response received, total cars:', data?.totalElements);

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] POST /api/cars/search error:', error);

        if (isApiException(error)) {
            console.error('[API] ApiException details:', {
                status: error.status,
                message: error.message,
                errors: error.errors,
            });
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
            console.error('[API] Backend connection failed - is the backend running?');
            return NextResponse.json(
                { error: 'Cannot connect to backend server. Please ensure the API is running.' },
                { status: 503 }
            );
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `Failed to search cars: ${errorMessage}` },
            { status: 500 }
        );
    }
}

