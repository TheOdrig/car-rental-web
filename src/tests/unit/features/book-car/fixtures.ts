import type { BookingRequest, Booking, AvailabilityFilters, AvailableCar } from '@/features/book-car/model/types';

export const createMockBookingRequest = (overrides = {}): BookingRequest => ({
    carId: 1,
    startDate: '2025-02-01T00:00:00Z',
    endDate: '2025-02-05T00:00:00Z',
    notes: 'Test booking',
    ...overrides,
});

export const createMockBooking = (overrides = {}): Booking => ({
    id: 1,
    carSummary: {
        id: 1,
        brand: 'Toyota',
        model: 'Corolla',
        licensePlate: '34ABC123',
        productionYear: 2023,
        formattedPrice: '$50/day',
        currencyType: 'USD',
        carStatusType: 'Available',
        thumbnailUrl: '/cars/toyota-corolla.jpg',
    },
    startDate: '2025-02-01T00:00:00Z',
    endDate: '2025-02-05T00:00:00Z',
    days: 4,
    dailyPrice: 50,
    totalPrice: 200,
    currency: 'USD',
    status: 'Requested',
    notes: 'Test booking',
    createTime: '2025-01-28T00:00:00Z',
    updateTime: '2025-01-28T00:00:00Z',
    ...overrides,
});

export const createMockAvailabilityFilters = (overrides = {}): AvailabilityFilters => ({
    startDate: '2025-02-01T00:00:00Z',
    endDate: '2025-02-05T00:00:00Z',
    brand: 'Toyota',
    transmission: 'AUTOMATIC',
    ...overrides,
});

export const createMockAvailableCar = (overrides = {}): AvailableCar => ({
    id: 1,
    licensePlate: '34ABC123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2023,
    transmission: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    seats: 5,
    dailyPrice: 50,
    currency: 'USD',
    imageUrl: '/cars/toyota-corolla.jpg',
    isAvailable: true,
    ...overrides,
});
