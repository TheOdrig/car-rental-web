import { type Car, type CarAvailabilityCalendar, type SimilarCar } from '@/entities/car';
import { logger } from '@/shared/lib/logger';
import { API, parseIdParam, route, searchParamsOf, upstream } from '@/shared/server';

const SIMILAR_WINDOW_DAYS = 30;

function toDateOnly(date: Date): string {
    return date.toISOString().split('T')[0];
}

async function optional<T>(label: string, request: Promise<T>): Promise<T | undefined> {
    try {
        return await request;
    } catch (error) {
        logger.warn(`[BFF] ${label} fetch failed`, error);
        return undefined;
    }
}

export const GET = route<{ id: string }>(
    async (request, { id }) => {
        const carId = parseIdParam(id, 'car ID');
        const searchParams = searchParamsOf(request);
        const include = searchParams.get('include')?.split(',') ?? [];

        const car = await upstream.get<Car>(API.cars.byId.resolve({ id: carId }), {
            anonymous: true,
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
            response.calendar = await optional(
                'Calendar',
                upstream.get<CarAvailabilityCalendar>(API.cars.calendar.resolve({ id: carId }), {
                    params: { month: month ?? undefined },
                    anonymous: true,
                    cache: 'no-store',
                })
            );
        }

        if (include.includes('similar')) {
            const today = new Date();
            const windowEnd = new Date(today);
            windowEnd.setDate(today.getDate() + SIMILAR_WINDOW_DAYS);

            response.similarCars = await optional(
                'Similar cars',
                upstream.get<SimilarCar[]>(API.cars.similar.resolve({ id: carId }), {
                    params: {
                        startDate: searchParams.get('startDate') ?? toDateOnly(today),
                        endDate: searchParams.get('endDate') ?? toDateOnly(windowEnd),
                    },
                    anonymous: true,
                    cache: 'no-store',
                })
            );
        }

        return response;
    },
    { errorMessage: 'Failed to fetch car', errorStatus: 503 }
);
