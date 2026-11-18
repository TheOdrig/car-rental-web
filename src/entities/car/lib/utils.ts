import { Car, SortOption } from '../model/types';
import { formatCurrency } from '@/shared/lib';

export const isAvailable = (car: Car): boolean => {
    return car.carStatusType === 'Available';
};

export const getCarTitle = (car: Car): string => {
    return `${car.brand} ${car.model} (${car.productionYear})`;
};

export const getFormattedPrice = (car: Car): string => {
    return formatCurrency(car.price);
};

export function getSortParams(sortBy: SortOption): [string, string] {
    switch (sortBy) {
        case 'price-asc':
            return ['price', 'asc'];
        case 'price-desc':
            return ['price', 'desc'];
        case 'name-asc':
            return ['brand', 'asc'];
        case 'rating-desc':
            return ['rating', 'desc'];
        case 'recommended':
        default:
            return ['createTime', 'desc'];
    }
}

