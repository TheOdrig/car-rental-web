import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Rental } from '@/entities/rental';
import { RentalStatus } from '@/entities/rental';
import { getRentalsByTab, calculateTabCounts, calculateRentalStats, getActionButtons, RENTAL_TABS, getTabLabel, isUpcomingRental, formatRentalDuration, calculateDaysBetween } from '@/entities/rental';
const createMockRental = (overrides: Partial<Rental> = {}): Rental => ({
    id: 1,
    carSummary: {
        id: 1,
        licensePlate: 'ABC-123',
        brand: 'Toyota',
        model: 'Camry',
    },
    userSummary: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
    },
    startDate: '2025-01-01',
    paymentOpensOn: '2024-12-27',
    endDate: '2025-01-05',
    days: 4,
    dailyPrice: 50,
    totalPrice: 200,
    currency: 'USD',
    status: RentalStatus.CONFIRMED,
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
                createMockRental({ id: 1, status: RentalStatus.IN_USE }),
                createMockRental({ id: 2, status: RentalStatus.CONFIRMED, startDate: '2025-01-10' }),
                createMockRental({ id: 3, status: RentalStatus.CONFIRMED, startDate: '2024-12-20' }),
                createMockRental({ id: 4, status: RentalStatus.RETURNED }),
                createMockRental({ id: 5, status: RentalStatus.CANCELLED }),
                createMockRental({ id: 6, status: RentalStatus.REQUESTED }),
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
            expect(result[0].status).toBe(RentalStatus.IN_USE);
        });
        it('should return requested and confirmed rentals that have not started for the "upcoming" tab', () => {
            const result = getRentalsByTab(mockRentals, 'upcoming');
            expect(result.map((r) => r.id)).toEqual([2, 6]);
        });
        it('should not include past confirmed rentals in "upcoming" tab', () => {
            const result = getRentalsByTab(mockRentals, 'upcoming');
            const pastRental = result.find((r) => r.id === 3);
            expect(pastRental).toBeUndefined();
        });
        it('should return only completed rentals for "completed" tab', () => {
            const result = getRentalsByTab(mockRentals, 'completed');
            expect(result).toHaveLength(1);
            expect(result[0].status).toBe(RentalStatus.RETURNED);
        });
        it('should return only cancelled rentals for "cancelled" tab', () => {
            const result = getRentalsByTab(mockRentals, 'cancelled');
            expect(result).toHaveLength(1);
            expect(result[0].status).toBe(RentalStatus.CANCELLED);
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
                createMockRental({ id: 1, status: RentalStatus.IN_USE }),
                createMockRental({ id: 2, status: RentalStatus.IN_USE }),
                createMockRental({ id: 3, status: RentalStatus.CONFIRMED, startDate: '2025-01-10' }),
                createMockRental({ id: 4, status: RentalStatus.CONFIRMED, startDate: '2024-12-20' }),
                createMockRental({ id: 5, status: RentalStatus.RETURNED }),
                createMockRental({ id: 6, status: RentalStatus.RETURNED }),
                createMockRental({ id: 7, status: RentalStatus.RETURNED }),
                createMockRental({ id: 8, status: RentalStatus.CANCELLED }),
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
                createMockRental({ id: 1, status: RentalStatus.CONFIRMED, startDate: '2025-01-05' }),
                createMockRental({ id: 2, status: RentalStatus.CONFIRMED, startDate: '2025-02-01' }),
                createMockRental({ id: 3, status: RentalStatus.CONFIRMED, startDate: '2024-12-15' }),
            ];
            const counts = calculateTabCounts(futureDateRentals);
            expect(counts.upcoming).toBe(2);
        });
    });
    describe('calculateRentalStats', () => {
        it('should calculate correct stats', () => {
            const rentals = [
                createMockRental({ status: RentalStatus.IN_USE }),
                createMockRental({ status: RentalStatus.IN_USE }),
                createMockRental({ status: RentalStatus.RETURNED }),
                createMockRental({ status: RentalStatus.CONFIRMED }),
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
            const buttons = getActionButtons(RentalStatus.IN_USE);
            expect(buttons).toHaveLength(1);
            expect(buttons[0].label).toBe('View Details');
            expect(buttons[0].action).toBe('view');
        });
        it('should return correct buttons for "Confirmed" status', () => {
            const buttons = getActionButtons(RentalStatus.CONFIRMED);
            expect(buttons).toHaveLength(2);
            expect(buttons[0].label).toBe('View Details');
            expect(buttons[0].action).toBe('view');
            expect(buttons[1].label).toBe('Pay Now');
            expect(buttons[1].action).toBe('pay');
        });
        it('should disable Pay Now until the payment window opens', () => {
            const now = new Date(2025, 0, 1);
            const early = getActionButtons(RentalStatus.CONFIRMED, { paymentOpensOn: '2025-01-15', now });
            expect(early[1].disabled).toBe(true);
            expect(early[1].hint).toBe('Payment opens on Jan 15, 2025');
            const open = getActionButtons(RentalStatus.CONFIRMED, { paymentOpensOn: '2025-01-01', now });
            expect(open[1].disabled).toBeUndefined();
        });
        it('should return correct buttons for "Returned" status', () => {
            const buttons = getActionButtons(RentalStatus.RETURNED);
            expect(buttons).toHaveLength(1);
            expect(buttons[0].label).toBe('Book Again');
        });
        it('should return correct buttons for "Requested" status', () => {
            const buttons = getActionButtons(RentalStatus.REQUESTED);
            expect(buttons).toHaveLength(2);
            expect(buttons[0].label).toBe('View Details');
            expect(buttons[1].label).toBe('Cancel');
            expect(buttons[1].variant).toBe('destructive');
        });
        it('should return empty array for "Cancelled" status', () => {
            const buttons = getActionButtons(RentalStatus.CANCELLED);
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
                status: RentalStatus.CONFIRMED,
                startDate: '2025-01-10',
            });
            expect(isUpcomingRental(rental)).toBe(true);
        });
        it('should return false for confirmed rental with past start date', () => {
            const rental = createMockRental({
                status: RentalStatus.CONFIRMED,
                startDate: '2024-12-20',
            });
            expect(isUpcomingRental(rental)).toBe(false);
        });
        it('should return false for non-confirmed rental even with future date', () => {
            const rental = createMockRental({
                status: RentalStatus.IN_USE,
                startDate: '2025-01-10',
            });
            expect(isUpcomingRental(rental)).toBe(false);
        });
        it('should return true for confirmed rental starting today', () => {
            const rental = createMockRental({
                status: RentalStatus.CONFIRMED,
                startDate: '2025-01-01',
            });
            expect(isUpcomingRental(rental)).toBe(true);
        });
        it('should return true for requested rental with future start date', () => {
            const rental = createMockRental({
                status: RentalStatus.REQUESTED,
                startDate: '2025-01-10',
            });
            expect(isUpcomingRental(rental)).toBe(true);
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