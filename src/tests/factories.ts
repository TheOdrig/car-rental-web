import type { Car, CarSummary, CarStatus } from '@/types/car';
import type { Rental, RentalStatus } from '@/types/rental';
import type { User, UserSummary, Role } from '@/types/auth';
import type { DailySummary, FleetStatus, QuickActionResult } from '@/types/admin';
import type { CurrencyType } from '@/types/common';

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


let userIdCounter = 1;

export function createMockUserSummary(overrides?: Partial<UserSummary>): UserSummary {
    const id = userIdCounter++;
    return {
        id,
        username: `user${id}`,
        email: `user${id}@example.com`,
        ...overrides,
    };
}

export function createMockUser(overrides?: Partial<User>): User {
    const id = userIdCounter++;
    return {
        id,
        username: `user${id}`,
        email: `user${id}@example.com`,
        firstName: 'Test',
        lastName: `User${id}`,
        roles: ['USER'] as Role[],
        createdAt: new Date().toISOString(),
        ...overrides,
    };
}

export function createMockAdmin(overrides?: Partial<User>): User {
    return createMockUser({
        roles: ['ADMIN'] as Role[],
        firstName: 'Admin',
        ...overrides,
    });
}


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


export function createMockDailySummary(overrides?: Partial<DailySummary>): DailySummary {
    return {
        pendingApprovals: 5,
        todaysPickups: 3,
        todaysReturns: 4,
        overdueRentals: 2,
        pendingDamageAssessments: 1,
        generatedAt: new Date().toISOString(),
        ...overrides,
    };
}

export function createMockFleetStatus(overrides?: Partial<FleetStatus>): FleetStatus {
    return {
        totalCars: 50,
        availableCars: 30,
        rentedCars: 15,
        reservedCars: 2,
        maintenanceCars: 3,
        inspectionCars: 0,
        damagedCars: 2,
        occupancyRate: 0.4,
        generatedAt: new Date().toISOString(),
        ...overrides,
    };
}

export function createMockQuickActionResult(
    success: boolean,
    overrides?: Partial<QuickActionResult>
): QuickActionResult {
    return {
        success,
        message: success ? 'Action completed successfully' : 'Action failed',
        ...overrides,
    };
}

import type {
    Addon,
    PriceBreakdown,
    BookingConfirmation,
    CheckoutFormData,
} from '@/types/checkout';

let bookingIdCounter = 1;

export function createMockAddon(overrides?: Partial<Addon>): Addon {
    return {
        id: 'cdw',
        name: 'Collision Damage Waiver',
        description: 'Full coverage for collision damage.',
        pricePerDay: 15,
        icon: 'shield-check',
        popular: true,
        ...overrides,
    };
}

export function createMockPriceBreakdown(overrides?: Partial<PriceBreakdown>): PriceBreakdown {
    return {
        rentalDays: 3,
        dailyRate: 100,
        rentalCost: 300,
        taxesAndFees: 36,
        addonsCost: 45,
        addonsDetail: [{ name: 'CDW', cost: 45 }],
        total: 381,
        currency: 'USD',
        ...overrides,
    };
}

export function createMockCheckoutFormData(overrides?: Partial<CheckoutFormData>): CheckoutFormData {
    return {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 555 123 4567',
        cardNumber: '4111 1111 1111 1111',
        expiryDate: '12/29',
        cvc: '123',
        cardholderName: 'JOHN DOE',
        addons: [],
        ...overrides,
    };
}

export function createMockBookingConfirmation(overrides?: Partial<BookingConfirmation>): BookingConfirmation {
    const id = bookingIdCounter++;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3);

    return {
        referenceNumber: `BKG${id.toString().padStart(6, '0')}`,
        status: 'confirmed',
        car: {
            id: 1,
            name: 'Toyota Corolla',
            image: '/cars/toyota-corolla.jpg',
            category: 'Sedan',
        },
        dates: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            days: 3,
        },
        locations: {
            pickup: 'LAX Airport',
            dropoff: 'LAX Airport',
        },
        payment: {
            total: 381,
            currency: 'USD',
            method: 'Visa',
            last4: '1111',
        },
        addons: [],
        createdAt: new Date().toISOString(),
        ...overrides,
    };
}

export function resetMockFactories() {
    carIdCounter = 1;
    userIdCounter = 1;
    rentalIdCounter = 1;
    bookingIdCounter = 1;
}
