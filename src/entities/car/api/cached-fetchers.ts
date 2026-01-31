import { cache } from 'react';
import { serverGet } from '@/shared/api/server';
import { CAR_ENDPOINTS } from './endpoints';
import type { Car, CarAvailabilityCalendar } from '../model/types';

export const getCar = cache(async (carId: number): Promise<Car> => {
    return serverGet<Car>(
        CAR_ENDPOINTS.byId(carId),
        { tags: ['cars', `car-${carId}`] }
    );
});

export const getCarCalendar = cache(async (carId: number): Promise<CarAvailabilityCalendar | undefined> => {
    try {
        return await serverGet<CarAvailabilityCalendar>(
            CAR_ENDPOINTS.availability.calendar(carId),
            { tags: [`car-${carId}-calendar`] }
        );
    } catch {
        return undefined;
    }
});
