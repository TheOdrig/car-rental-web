import type { BookingConfirmation } from '@/features/book-car/model/types';
export const createMockBooking = (overrides = {}): BookingConfirmation => ({
    referenceNumber: 'BOOK-001',
    status: 'confirmed',
    car: {
        id: 1,
        name: 'Toyota Corolla',
        image: '/cars/toyota-corolla.jpg',
        category: 'Sedan',
    },
    dates: {
        start: '2025-02-01T00:00:00Z',
        end: '2025-02-05T00:00:00Z',
        days: 4,
    },
    locations: {
        pickup: 'Downtown Office',
        dropoff: 'Airport',
    },
    payment: {
        total: 200,
        currency: 'USD',
        method: 'Credit Card',
        last4: '1234',
    },
    addons: [],
    createdAt: '2025-01-28T00:00:00Z',
    ...overrides,
});