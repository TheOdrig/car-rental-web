import type { Rental, RentalStatus } from '@/entities/rental';
import type { CurrencyType } from '@/shared/types';
import { createMockCarSummary } from '@/entities/car/lib/testing/factories';
import { createMockUserSummary } from '@/entities/user/lib/testing/factories';

let rentalIdCounter = 1;

export function createMockRental(overrides?: Partial<Rental>): Rental {
    const id = rentalIdCounter++;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3);
    return {
        id,
        carSummary: createMockCarSummary(),
        userSummary: createMockUserSummary(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: 3,
        dailyPrice: 50,
        totalPrice: 150,
        currency: 'USD' as CurrencyType,
        status: 'Requested' as RentalStatus,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        ...overrides,
    };
}

export function createMockRentals(count: number, overrides?: Partial<Rental>): Rental[] {
    return Array.from({ length: count }, () => createMockRental(overrides));
}

export function resetRentalCounters() {
    rentalIdCounter = 1;
}