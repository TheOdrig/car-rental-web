import { NextRequest, NextResponse } from 'next/server';
import { serverPost } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';
import type { AvailabilitySearchRequest, AvailabilitySearchResponse } from '@/types';


export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as AvailabilitySearchRequest;

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

        const data = await serverPost<AvailabilitySearchResponse>(
            endpoints.cars.availability.search,
            body
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] POST /api/cars/search error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to search cars' },
            { status: 503 }
        );
    }
}
