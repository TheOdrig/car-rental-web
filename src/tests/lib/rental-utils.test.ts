import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Rental, RentalStatus } from '@/types';
import {
    getRentalsByTab,
    calculateTabCounts,
    calculateRentalStats,
    getActionButtons,
    RENTAL_TABS,
    getTabLabel,
    isUpcomingRental,
    getStatusBadgeVariant,
    formatRentalDuration,
    calculateDaysBetween,
} from '@/lib/utils/rental-utils';

const createMockRental = (overrides: Partial<Rental> = {}): Rental => ({
    id: 1,
    carSummary: {
        id: 1,
        licensePlate: 'ABC-123',
        brand: 'Toyota',
        model: 'Camry',
        productionYear: 2023,
        formattedPrice: '$50/day',
        currencyType: 'USD',
        carStatusType: 'Available',
    },
    userSummary: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
    },
    startDate: '2025-01-01',
    endDate: '2025-01-05',
    days: 4,
    dailyPrice: 50,
    totalPrice: 200,
    currency: 'USD',
    status: 'Confirmed',
    createTime: '2024-12-25T10:00:00Z',
    updateTime: '2024-12-25T10:00:00Z',
    ...overrides,
});

describe('Rental Utils', () => {
    describe('getRentalsByTab', () => {
        let mockRentals: Rental[];

        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2025-01-01'));

            mockRentals = [
                createMockRental({ id: 1, status: 'In Use' }),
                createMockRental({ id: 2, status: 'Confirmed', startDate: '2025-01-10' }),
                createMockRental({ id: 3, status: 'Confirmed', startDate: '2024-12-20' }),
                createMockRental({ id: 4, status: 'Returned' }),
                createMockRental({ id: 5, status: 'Cancelled' }),
                createMockRental({ id: 6, status: 'Requested' }),
            ];
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return all rentals for "all" tab', () => {
            const result = getRentalsByTab(mockRentals, 'all');
            expect(result).toHaveLength(6);
        });

        it('should return only active rentals for "active" tab', () => {
            const result = getRentalsByTab(mockRentals, 'active');
            expect(result).toHaveLength(1);
            expect(result[0].status).toBe('In Use');
        });

        it('should return only upcoming rentals for "upcoming" tab', () => {
            const result = getRentalsByTab(mockRentals, 'upcoming');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(2);
            expect(result[0].status).toBe('Confirmed');
        });

        it('should not include past confirmed rentals in "upcoming" tab', () => {
            const result = getRentalsByTab(mockRentals, 'upcoming');
            const pastRental = result.find((r) => r.id === 3);
            expect(pastRental).toBeUndefined();
        });

        it('should return only completed rentals for "completed" tab', () => {
            const result = getRentalsByTab(mockRentals, 'completed');
            expect(result).toHaveLength(1);
            expect(result[0].status).toBe('Returned');
        });

        it('should return only cancelled rentals for "cancelled" tab', () => {
            const result = getRentalsByTab(mockRentals, 'cancelled');
            expect(result).toHaveLength(1);
            expect(result[0].status).toBe('Cancelled');
        });

        it('should return all rentals for unknown tab', () => {
            const result = getRentalsByTab(mockRentals, 'unknown' as never);
            expect(result).toHaveLength(6);
        });

        it('should handle empty rentals array', () => {
            const result = getRentalsByTab([], 'all');
            expect(result).toHaveLength(0);
        });
    });

    describe('calculateTabCounts', () => {
        let mockRentals: Rental[];

        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2025-01-01'));

            mockRentals = [
                createMockRental({ id: 1, status: 'In Use' }),
                createMockRental({ id: 2, status: 'In Use' }),
                createMockRental({ id: 3, status: 'Confirmed', startDate: '2025-01-10' }),
                createMockRental({ id: 4, status: 'Confirmed', startDate: '2024-12-20' }),
                createMockRental({ id: 5, status: 'Returned' }),
                createMockRental({ id: 6, status: 'Returned' }),
                createMockRental({ id: 7, status: 'Returned' }),
                createMockRental({ id: 8, status: 'Cancelled' }),
            ];
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should calculate correct counts for all tabs', () => {
            const counts = calculateTabCounts(mockRentals);

            expect(counts.all).toBe(8);
            expect(counts.active).toBe(2);
            expect(counts.upcoming).toBe(1);
            expect(counts.completed).toBe(3);
            expect(counts.cancelled).toBe(1);
        });

        it('should handle empty rentals array', () => {
            const counts = calculateTabCounts([]);

            expect(counts.all).toBe(0);
            expect(counts.active).toBe(0);
            expect(counts.upcoming).toBe(0);
            expect(counts.completed).toBe(0);
            expect(counts.cancelled).toBe(0);
        });

        it('should count upcoming correctly based on future dates', () => {
            const futureDateRentals = [
                createMockRental({ id: 1, status: 'Confirmed', startDate: '2025-01-05' }),
                createMockRental({ id: 2, status: 'Confirmed', startDate: '2025-02-01' }),
                createMockRental({ id: 3, status: 'Confirmed', startDate: '2024-12-15' }),
            ];

            const counts = calculateTabCounts(futureDateRentals);
            expect(counts.upcoming).toBe(2);
        });
    });

    describe('calculateRentalStats', () => {
        it('should calculate correct stats', () => {
            const rentals = [
                createMockRental({ status: 'In Use' }),
                createMockRental({ status: 'In Use' }),
                createMockRental({ status: 'Returned' }),
                createMockRental({ status: 'Confirmed' }),
            ];

            const stats = calculateRentalStats(rentals);

            expect(stats.totalRentals).toBe(4);
            expect(stats.activeTrips).toBe(2);
        });

        it('should handle empty rentals', () => {
            const stats = calculateRentalStats([]);

            expect(stats.totalRentals).toBe(0);
            expect(stats.activeTrips).toBe(0);
        });
    });

    describe('getActionButtons', () => {
        it('should return correct buttons for "In Use" status', () => {
            const buttons = getActionButtons('In Use');

            expect(buttons).toHaveLength(1);
            expect(buttons[0].label).toBe('View Details');
            expect(buttons[0].action).toBe('view');
        });

        it('should return correct buttons for "Confirmed" status', () => {
            const buttons = getActionButtons('Confirmed');

            expect(buttons).toHaveLength(1);
            expect(buttons[0].label).toBe('View Details');
            expect(buttons[0].action).toBe('view');
        });

        it('should return correct buttons for "Returned" status', () => {
            const buttons = getActionButtons('Returned');

            expect(buttons).toHaveLength(2);
            expect(buttons[0].label).toBe('Receipt');
            expect(buttons[0].icon).toBe('receipt');
            expect(buttons[1].label).toBe('Book Again');
        });

        it('should return correct buttons for "Requested" status', () => {
            const buttons = getActionButtons('Requested');

            expect(buttons).toHaveLength(2);
            expect(buttons[0].label).toBe('View Details');
            expect(buttons[1].label).toBe('Cancel');
            expect(buttons[1].variant).toBe('destructive');
        });

        it('should return empty array for "Cancelled" status', () => {
            const buttons = getActionButtons('Cancelled');
            expect(buttons).toHaveLength(0);
        });

        it('should return empty array for unknown status', () => {
            const buttons = getActionButtons('Unknown' as RentalStatus);
            expect(buttons).toHaveLength(0);
        });
    });

    describe('RENTAL_TABS', () => {
        it('should have 5 tabs defined', () => {
            expect(RENTAL_TABS).toHaveLength(5);
        });

        it('should have correct tab values', () => {
            const values = RENTAL_TABS.map((t) => t.value);
            expect(values).toEqual(['all', 'active', 'upcoming', 'completed', 'cancelled']);
        });

        it('should have correct tab labels', () => {
            const labels = RENTAL_TABS.map((t) => t.label);
            expect(labels).toEqual(['All', 'Active', 'Upcoming', 'Completed', 'Cancelled']);
        });
    });

    describe('getTabLabel', () => {
        it('should return correct label for each tab', () => {
            expect(getTabLabel('all')).toBe('All');
            expect(getTabLabel('active')).toBe('Active');
            expect(getTabLabel('upcoming')).toBe('Upcoming');
            expect(getTabLabel('completed')).toBe('Completed');
            expect(getTabLabel('cancelled')).toBe('Cancelled');
        });

        it('should return "All" for unknown tab', () => {
            expect(getTabLabel('unknown' as never)).toBe('All');
        });
    });

    describe('isUpcomingRental', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2025-01-01'));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return true for confirmed rental with future start date', () => {
            const rental = createMockRental({
                status: 'Confirmed',
                startDate: '2025-01-10',
            });

            expect(isUpcomingRental(rental)).toBe(true);
        });

        it('should return false for confirmed rental with past start date', () => {
            const rental = createMockRental({
                status: 'Confirmed',
                startDate: '2024-12-20',
            });

            expect(isUpcomingRental(rental)).toBe(false);
        });

        it('should return false for non-confirmed rental even with future date', () => {
            const rental = createMockRental({
                status: 'In Use',
                startDate: '2025-01-10',
            });

            expect(isUpcomingRental(rental)).toBe(false);
        });

        it('should return false for confirmed rental starting today', () => {
            const rental = createMockRental({
                status: 'Confirmed',
                startDate: '2025-01-01',
            });

            expect(isUpcomingRental(rental)).toBe(false);
        });
    });

    describe('getStatusBadgeVariant', () => {
        it('should return "default" for "In Use"', () => {
            expect(getStatusBadgeVariant('In Use')).toBe('default');
        });

        it('should return "secondary" for "Confirmed"', () => {
            expect(getStatusBadgeVariant('Confirmed')).toBe('secondary');
        });

        it('should return "outline" for "Returned"', () => {
            expect(getStatusBadgeVariant('Returned')).toBe('outline');
        });

        it('should return "secondary" for "Requested"', () => {
            expect(getStatusBadgeVariant('Requested')).toBe('secondary');
        });

        it('should return "destructive" for "Cancelled"', () => {
            expect(getStatusBadgeVariant('Cancelled')).toBe('destructive');
        });

        it('should return "outline" for unknown status', () => {
            expect(getStatusBadgeVariant('Unknown' as RentalStatus)).toBe('outline');
        });
    });

    describe('formatRentalDuration', () => {
        it('should return "1 day" for single day', () => {
            expect(formatRentalDuration(1)).toBe('1 day');
        });

        it('should return plural for multiple days', () => {
            expect(formatRentalDuration(2)).toBe('2 days');
            expect(formatRentalDuration(5)).toBe('5 days');
            expect(formatRentalDuration(30)).toBe('30 days');
        });

        it('should handle zero days', () => {
            expect(formatRentalDuration(0)).toBe('0 days');
        });
    });

    describe('calculateDaysBetween', () => {
        it('should calculate correct days between dates', () => {
            expect(calculateDaysBetween('2025-01-01', '2025-01-05')).toBe(4);
        });

        it('should return 0 for same dates', () => {
            expect(calculateDaysBetween('2025-01-01', '2025-01-01')).toBe(0);
        });

        it('should handle reversed dates (absolute difference)', () => {
            expect(calculateDaysBetween('2025-01-05', '2025-01-01')).toBe(4);
        });

        it('should handle month boundaries', () => {
            expect(calculateDaysBetween('2025-01-30', '2025-02-02')).toBe(3);
        });

        it('should handle year boundaries', () => {
            expect(calculateDaysBetween('2024-12-30', '2025-01-02')).toBe(3);
        });
    });
});