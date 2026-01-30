import { cache } from 'react';
import { serverGet } from '@/shared/api/server';
import { endpoints } from '@/shared/api/endpoints';
import type { Car, CarAvailabilityCalendar } from '../model/types';

export const getCar = cache(async (carId: number): Promise<Car> => {
    return serverGet<Car>(
        endpoints.cars.byId(carId),
        { tags: ['cars', `car-${carId}`] }
    );
});

export const getCarCalendar = cache(async (carId: number): Promise<CarAvailabilityCalendar | undefined> => {
    try {
        return await serverGet<CarAvailabilityCalendar>(
            endpoints.cars.availability.calendar(carId),
            { tags: [`car-${carId}-calendar`] }
        );
    } catch {
        return undefined;
    }
});
