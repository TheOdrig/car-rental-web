import { cache } from 'react';
import { upstream } from '@/shared/server';
import { CAR_ENDPOINTS } from './endpoints';
import type { Car, CarAvailabilityCalendar } from '../model/types';

export const getCar = cache(async (carId: number): Promise<Car> => {
    return upstream.get<Car>(
        CAR_ENDPOINTS.byId(carId),
        { anonymous: true, tags: ['cars', `car-${carId}`] }
    );
});

export const getCarCalendar = cache(async (carId: number): Promise<CarAvailabilityCalendar | undefined> => {
    try {
        return await upstream.get<CarAvailabilityCalendar>(
            CAR_ENDPOINTS.availability.calendar(carId),
            { anonymous: true, tags: [`car-${carId}-calendar`] }
        );
    } catch {
        return undefined;
    }
});