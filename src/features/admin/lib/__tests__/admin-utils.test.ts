import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatTime } from '@/shared/lib';
import { formatTrend, validatePickupForm, validateRejectForm, calculateFleetPercentages, processRevenueData, revenueCurrencies, getAlertStyles, niceAxisTicks } from '@/features/admin';
import { MonthlyRevenue } from '@/features/admin';
describe('formatCurrency', () => {
    it('should format positive amounts with dollar sign', () => {
        expect(formatCurrency(1000)).toBe('$1,000.00');
    });
    it('should format large amounts with commas', () => {
        expect(formatCurrency(1234567)).toBe('$1,234,567.00');
    });
    it('should format zero correctly', () => {
        expect(formatCurrency(0)).toBe('$0.00');
    });
    it('should keep two decimal places', () => {
        expect(formatCurrency(99.99)).toBe('$99.99');
    });
    it('should handle negative amounts', () => {
        expect(formatCurrency(-500)).toBe('-$500.00');
    });
});
describe('formatTrend', () => {
    it('should format positive values with plus sign', () => {
        expect(formatTrend(12.5)).toBe('+12.5%');
    });
    it('should format negative values with minus sign', () => {
        expect(formatTrend(-3.2)).toBe('-3.2%');
    });
    it('should format zero with plus sign', () => {
        expect(formatTrend(0)).toBe('+0.0%');
    });
    it('should format to one decimal place', () => {
        expect(formatTrend(12.567)).toBe('+12.6%');
    });
    it('should handle whole numbers', () => {
        expect(formatTrend(10)).toBe('+10.0%');
    });
});
describe('formatDate', () => {
    it('should format Date object correctly', () => {
        const date = new Date('2024-10-12');
        const result = formatDate(date);
        expect(result).toBe('Oct 12, 2024');
    });
    it('should format ISO string correctly', () => {
        const result = formatDate('2024-01-15');
        expect(result).toBe('Jan 15, 2024');
    });
    it('should handle different months', () => {
        expect(formatDate('2024-06-01')).toBe('Jun 1, 2024');
        expect(formatDate('2024-12-25')).toBe('Dec 25, 2024');
    });
});
describe('formatTime', () => {
    it('should format morning time correctly', () => {
        const date = new Date('2024-01-01T09:30:00');
        const result = formatTime(date);
        expect(result).toMatch(/9:30 AM/i);
    });
    it('should format afternoon time correctly', () => {
        const date = new Date('2024-01-01T14:15:00');
        const result = formatTime(date);
        expect(result).toMatch(/2:15 PM/i);
    });
    it('should handle ISO string input', () => {
        const result = formatTime('2024-01-01T16:45:00Z');
        expect(result).toMatch(/\d{1,2}:45\s(AM|PM)/i);
    });
    it('should format midnight correctly', () => {
        const date = new Date('2024-01-01T00:00:00');
        const result = formatTime(date);
        expect(result).toMatch(/12:00 AM/i);
    });
    it('should format noon correctly', () => {
        const date = new Date('2024-01-01T12:00:00');
        const result = formatTime(date);
        expect(result).toMatch(/12:00 PM/i);
    });
});
describe('validatePickupForm', () => {
    it('should return true when both checkboxes are checked', () => {
        const result = validatePickupForm({
            idVerified: true,
            conditionInspected: true,
        });
        expect(result).toBe(true);
    });
    it('should return false when ID is not verified', () => {
        const result = validatePickupForm({
            idVerified: false,
            conditionInspected: true,
        });
        expect(result).toBe(false);
    });
    it('should return false when condition is not inspected', () => {
        const result = validatePickupForm({
            idVerified: true,
            conditionInspected: false,
        });
        expect(result).toBe(false);
    });
    it('should return false when both are unchecked', () => {
        const result = validatePickupForm({
            idVerified: false,
            conditionInspected: false,
        });
        expect(result).toBe(false);
    });
});
describe('validateRejectForm', () => {
    it('should return true for non-empty reason', () => {
        expect(validateRejectForm('Vehicle not available')).toBe(true);
    });
    it('should return false for empty string', () => {
        expect(validateRejectForm('')).toBe(false);
    });
    it('should return false for whitespace only', () => {
        expect(validateRejectForm('   ')).toBe(false);
        expect(validateRejectForm('\n\t')).toBe(false);
    });
    it('should return true for string with leading/trailing whitespace', () => {
        expect(validateRejectForm('  Valid reason  ')).toBe(true);
    });
});
describe('calculateFleetPercentages', () => {
    it('should calculate percentages correctly', () => {
        const result = calculateFleetPercentages({
            totalCars: 100,
            availableCars: 25,
            rentedCars: 50,
            maintenanceCars: 15,
            damagedCars: 10,
        });
        expect(result.available).toBe(25);
        expect(result.rented).toBe(50);
        expect(result.maintenance).toBe(15);
        expect(result.damaged).toBe(10);
    });
    it('should handle zero total cars', () => {
        const result = calculateFleetPercentages({
            totalCars: 0,
            availableCars: 0,
            rentedCars: 0,
            maintenanceCars: 0,
            damagedCars: 0,
        });
        expect(result.available).toBe(0);
        expect(result.rented).toBe(0);
        expect(result.maintenance).toBe(0);
        expect(result.damaged).toBe(0);
    });
    it('should round percentages to nearest integer', () => {
        const result = calculateFleetPercentages({
            totalCars: 3,
            availableCars: 1,
            rentedCars: 1,
            maintenanceCars: 1,
            damagedCars: 0,
        });
        expect(result.available).toBe(33);
        expect(result.rented).toBe(33);
        expect(result.maintenance).toBe(33);
        expect(result.damaged).toBe(0);
    });
    it('should handle uneven distributions', () => {
        const result = calculateFleetPercentages({
            totalCars: 50,
            availableCars: 32,
            rentedCars: 10,
            maintenanceCars: 5,
            damagedCars: 3,
        });
        expect(result.available).toBe(64);
        expect(result.rented).toBe(20);
        expect(result.maintenance).toBe(10);
        expect(result.damaged).toBe(6);
    });
});
describe('processRevenueData', () => {
    const mockData: MonthlyRevenue[] = [
        { month: '2024-06', revenue: 6000, currency: 'USD', paymentCount: 60, growthPercentage: 0 },
        { month: '2024-05', revenue: 5000, currency: 'USD', paymentCount: 50, growthPercentage: 0 },
        { month: '2024-04', revenue: 4000, currency: 'USD', paymentCount: 40, growthPercentage: 0 },
        { month: '2024-03', revenue: 3000, currency: 'USD', paymentCount: 30, growthPercentage: 0 },
        { month: '2024-02', revenue: 2000, currency: 'USD', paymentCount: 20, growthPercentage: 0 },
        { month: '2024-01', revenue: 1000, currency: 'USD', paymentCount: 10, growthPercentage: 0 },
        { month: '2023-12', revenue: 1200, currency: 'USD', paymentCount: 12, growthPercentage: 0 },
        { month: '2023-11', revenue: 1100, currency: 'USD', paymentCount: 11, growthPercentage: 0 },
    ];
    it('should filter for last 6 months by default', () => {
        const result = processRevenueData(mockData);
        expect(result).toHaveLength(6);
        expect(result[0].month).toBe('Jan');
        expect(result[5].month).toBe('Jun');
        expect(result[5].isCurrent).toBe(true);
    });
    it('should filter for last year (up to 12 months)', () => {
        const result = processRevenueData(mockData, 'lastyear');
        expect(result).toHaveLength(8);
        expect(result[0].month).toBe('Nov');
        expect(result[7].month).toBe('Jun');
    });
    it('should identify the most recent month as isCurrent', () => {
        const result = processRevenueData(mockData);
        const currentMonth = result.find(r => r.isCurrent);
        expect(currentMonth?.month).toBe('Jun');
    });
    it('should sort data chronologically regardless of input order', () => {
        const shuffled = [...mockData].sort(() => Math.random() - 0.5);
        const result = processRevenueData(shuffled, 'last6months');
        expect(result[0].month).toBe('Jan');
        expect(result[5].month).toBe('Jun');
    });
    it('should handle empty data', () => {
        expect(processRevenueData([])).toEqual([]);
    });
    it('should handle data spanning multiple years', () => {
        const multiYearData: MonthlyRevenue[] = [
            { month: '2024-01', revenue: 100, currency: 'USD', paymentCount: 1, growthPercentage: 0 },
            { month: '2023-12', revenue: 200, currency: 'USD', paymentCount: 1, growthPercentage: 0 },
        ];
        const result = processRevenueData(multiYearData);
        expect(result[0].month).toBe('Dec');
        expect(result[1].month).toBe('Jan');
    });
});
describe('processRevenueData by currency', () => {
    const mixed: MonthlyRevenue[] = [
        { month: '2024-02', revenue: 200, currency: 'TRY', paymentCount: 2, growthPercentage: 10 },
        { month: '2024-02', revenue: 20, currency: 'USD', paymentCount: 1, growthPercentage: 5 },
        { month: '2024-01', revenue: 100, currency: 'TRY', paymentCount: 1, growthPercentage: 0 },
        { month: '2024-01', revenue: 10, currency: 'USD', paymentCount: 1, growthPercentage: 0 },
    ];
    it('keeps each currency on its own series and never sums them', () => {
        expect(processRevenueData(mixed, 'last6months', 'TRY').map((p) => p.revenue)).toEqual([100, 200]);
        expect(processRevenueData(mixed, 'last6months', 'USD').map((p) => p.revenue)).toEqual([10, 20]);
    });
    it('lists the currencies of the breakdown and the monthly rows once, sorted', () => {
        expect(
            revenueCurrencies({
                breakdownByCurrency: [{ currency: 'USD' }, { currency: 'TRY' }],
                monthlyRevenue: [...mixed, { month: '2024-03', revenue: 1, currency: 'EUR', paymentCount: 1, growthPercentage: 0 }],
            })
        ).toEqual(['EUR', 'TRY', 'USD']);
        expect(revenueCurrencies(undefined)).toEqual([]);
    });
});
describe('getAlertStyles', () => {
    it('should return correct styles for critical variant', () => {
        const styles = getAlertStyles('critical');
        expect(styles.border).toBe('border-danger-subtle-foreground/30');
        expect(styles.bg).toBe('bg-danger-subtle');
        expect(styles.iconColor).toBe('text-danger-subtle-foreground');
    });
    it('should return correct styles for warning variant', () => {
        const styles = getAlertStyles('warning');
        expect(styles.border).toBe('border-warning-subtle-foreground/30');
        expect(styles.bg).toBe('bg-warning-subtle');
        expect(styles.iconColor).toBe('text-warning-subtle-foreground');
    });
    it('should return correct styles for info variant', () => {
        const styles = getAlertStyles('info');
        expect(styles.border).toBe('border-info-subtle-foreground/30');
        expect(styles.bg).toBe('bg-info-subtle');
        expect(styles.iconColor).toBe('text-info-subtle-foreground');
    });
    it('should return correct styles for success variant', () => {
        const styles = getAlertStyles('success');
        expect(styles.border).toBe('border-success-subtle-foreground/30');
        expect(styles.bg).toBe('bg-success-subtle');
        expect(styles.iconColor).toBe('text-success-subtle-foreground');
    });
});
describe('niceAxisTicks', () => {
    it('uses round steps that cover the maximum', () => {
        expect(niceAxisTicks(284.2)).toEqual([0, 100, 200, 300]);
        expect(niceAxisTicks(680.6)).toEqual([0, 200, 400, 600, 800]);
        expect(niceAxisTicks(11200)).toEqual([0, 5000, 10000, 15000]);
    });

    it('falls back to a unit axis without data', () => {
        expect(niceAxisTicks(0)).toEqual([0, 1]);
        expect(niceAxisTicks(Number.NaN)).toEqual([0, 1]);
    });

    it('keeps a tiny maximum readable', () => {
        const ticks = niceAxisTicks(0.7);
        expect(ticks[0]).toBe(0);
        expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(0.7);
    });
});
