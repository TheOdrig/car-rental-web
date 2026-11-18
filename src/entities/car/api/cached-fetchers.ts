import { cache } from 'react';
import { API, upstream } from '@/shared/server';
import type { Car, CarAvailabilityCalendar } from '../model/types';

export const getCar = cache(async (carId: number): Promise<Car> => {
    return upstream.get<Car>(
        API.cars.byId.resolve({ id: carId }),
        { anonymous: true, tags: ['cars', `car-${carId}`] }
    );
});

export const getCarCalendar = cache(async (carId: number): Promise<CarAvailabilityCalendar | undefined> => {
    try {
        return await upstream.get<CarAvailabilityCalendar>(
            API.cars.calendar.resolve({ id: carId }),
            { anonymous: true, tags: [`car-${carId}-calendar`] }
        );
    } catch {
        return undefined;
    }
});