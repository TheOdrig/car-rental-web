import { NextRequest, NextResponse } from 'next/server';
import { serverGet } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';
import type { Car, CarAvailabilityCalendar, SimilarCar } from '@/types';


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const carId = parseInt(id, 10);

    if (isNaN(carId)) {
        return NextResponse.json(
            { error: 'Invalid car ID' },
            { status: 400 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const include = searchParams.get('include')?.split(',') ?? [];

        const car = await serverGet<Car>(endpoints.cars.byId(carId), {
            cache: 'no-store',
            tags: ['cars', `car-${carId}`],
        });

        const response: {
            car: Car;
            calendar?: CarAvailabilityCalendar;
            similarCars?: SimilarCar[];
        } = { car };

        if (include.includes('calendar')) {
            const month = searchParams.get('month');
            const calendarUrl = new URL(endpoints.cars.availability.calendar(carId));
            if (month) {
                calendarUrl.searchParams.append('month', month);
            }


            try {
                response.calendar = await serverGet<CarAvailabilityCalendar>(
                    calendarUrl.toString(),
                    { cache: 'no-store' }
                );
            } catch (calendarError) {
                console.warn('[API] Calendar fetch failed:', calendarError);
            }
        }

        if (include.includes('similar')) {
            try {
                response.similarCars = await serverGet<SimilarCar[]>(
                    endpoints.cars.availability.similar(carId),
                    { cache: 'no-store' }
                );
            } catch (similarError) {
                console.warn('[API] Similar cars fetch failed:', similarError);
            }
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error(`[API] GET /api/cars/${id} error:`, error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch car' },
            { status: 503 }
        );
    }
}
