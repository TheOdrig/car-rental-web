import { Car, CarStatus } from '../model/types';
import { formatCurrency } from '@/shared/lib/format';

export const isAvailable = (car: Car): boolean => {
    return car.status === CarStatus.AVAILABLE;
};

export const getCarTitle = (car: Car): string => {
    return `${car.brand} ${car.model} (${car.year})`;
};

export const getFormattedPrice = (car: Car): string => {
    return formatCurrency(car.dailyPrice);
};
