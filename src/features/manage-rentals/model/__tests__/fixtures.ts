import type { RentalFilter, RentalActionRequest, RentalListItem, PaginatedRentals } from '@/features/manage-rentals';
import { type Rental, RentalStatus } from '@/entities/rental';

export const createMockRentalFilter = (overrides = {}): RentalFilter => ({
    status: RentalStatus.REQUESTED,
    ...overrides,
});

export const createMockRentalListItem = (overrides = {}): RentalListItem => ({
    id: 1,
    carName: 'Toyota Corolla',
    userName: 'John Doe',
    startDate: '2025-02-01T00:00:00Z',
    endDate: '2025-02-05T00:00:00Z',
    status: RentalStatus.REQUESTED,
    totalPrice: 200,
    currency: 'USD',
    ...overrides,
});

export const createMockPaginatedRentals = (overrides = {}): PaginatedRentals => ({
    rentals: [createMockRentalListItem()],
    totalElements: 1,
    totalPages: 1,
    currentPage: 0,
    pageSize: 10,
    ...overrides,
});

export const createMockRental = (overrides = {}): Rental => ({
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
    },
    userSummary: {
        id: 1,
        username: 'johndoe',
        email: 'john@example.com',
    },
    startDate: '2025-02-01T00:00:00Z',
    endDate: '2025-02-05T00:00:00Z',
    days: 4,
    dailyPrice: 50,
    totalPrice: 200,
    currency: 'USD',
    status: RentalStatus.REQUESTED,
    createTime: '2025-01-28T00:00:00Z',
    updateTime: '2025-01-28T00:00:00Z',
    ...overrides,
});

export const createMockRentalActionRequest = (overrides = {}): RentalActionRequest => ({
    rentalId: 1,
    action: 'approve',
    ...overrides,
});