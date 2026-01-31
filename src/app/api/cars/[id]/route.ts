import { NextRequest, NextResponse } from 'next/server';
import { serverGet } from '@/shared/api/server';
import { isApiError } from '@/shared/api';
import { carIdSchema, validateParams } from '@/shared/lib/validations';
import { CAR_ENDPOINTS, type Car, type CarAvailabilityCalendar, type SimilarCar } from '@/entities/car';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const validation = validateParams(carIdSchema, id);
    if (!validation.success) {
        return NextResponse.json(
            { error: validation.error },
            { status: 400 }
        );
    }

    const carId = validation.data;

    try {
        const { searchParams } = new URL(request.url);
        const include = searchParams.get('include')?.split(',') ?? [];

        const car = await serverGet<Car>(CAR_ENDPOINTS.byId(carId), {
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
            const calendarUrl = new URL(CAR_ENDPOINTS.availability.calendar(carId));
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
            const similarUrl = new URL(CAR_ENDPOINTS.availability.similar(carId));

            const startDate = searchParams.get('startDate');
            const endDate = searchParams.get('endDate');

            if (startDate && endDate) {
                similarUrl.searchParams.append('startDate', startDate);
                similarUrl.searchParams.append('endDate', endDate);
            } else {
                const today = new Date();
                const thirtyDaysLater = new Date(today);
                thirtyDaysLater.setDate(today.getDate() + 30);

                similarUrl.searchParams.append('startDate', today.toISOString().split('T')[0]);
                similarUrl.searchParams.append('endDate', thirtyDaysLater.toISOString().split('T')[0]);
            }

            try {
                response.similarCars = await serverGet<SimilarCar[]>(
                    similarUrl.toString(),
                    { cache: 'no-store' }
                );
            } catch (similarError) {
                console.warn('[API] Similar cars fetch failed:', similarError);
            }
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error(`[API] GET /api/cars/${id} error:`, error);

        if (isApiError(error)) {
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
