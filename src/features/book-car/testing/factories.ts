import type {
    Addon,
    PriceBreakdown,
    BookingConfirmation,
    CheckoutFormData,
} from '@/features/book-car';

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
        total: 300,
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

export function resetBookingCounters() {
    bookingIdCounter = 1;
}