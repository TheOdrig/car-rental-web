import type { Car, CarSummary, CarStatus } from '@/entities/car';
import type { CurrencyType } from '@/shared/types';

let carIdCounter = 1;

export function createMockCar(overrides?: Partial<Car>): Car {
    const id = carIdCounter++;
    return {
        id,
        licensePlate: `34ABC${id.toString().padStart(3, '0')}`,
        brand: 'Toyota',
        model: 'Corolla',
        productionYear: 2023,
        price: 50,
        currencyType: 'USD' as CurrencyType,
        carStatusType: 'Available' as CarStatus,
        fuelType: 'GASOLINE',
        transmissionType: 'AUTOMATIC',
        color: 'Silver',
        seats: 5,
        imageUrl: `/cars/toyota-corolla-${id}.jpg`,
        ...overrides,
    };
}

export function createMockCarSummary(overrides?: Partial<CarSummary>): CarSummary {
    const id = carIdCounter++;
    return {
        id,
        licensePlate: `34ABC${id.toString().padStart(3, '0')}`,
        brand: 'Toyota',
        model: 'Corolla',
        productionYear: 2023,
        formattedPrice: '$50.00/day',
        currencyType: 'USD' as CurrencyType,
        carStatusType: 'Available' as CarStatus,
        color: 'Silver',
        ...overrides,
    };
}

export function createMockCars(count: number, overrides?: Partial<Car>): Car[] {
    return Array.from({ length: count }, () => createMockCar(overrides));
}

export function resetCarCounters() {
    carIdCounter = 1;
}