import { describe, it, expect } from 'vitest';
import {
    formatCurrency,
    formatTrend,
    formatDate,
    formatTime,
    validatePickupForm,
    validateRejectForm,
    calculateFleetPercentages,
    processRevenueData,
} from '@/lib/utils/admin-utils';
import { MonthlyRevenue } from '@/types/admin';


describe('formatCurrency', () => {
    it('should format positive amounts with dollar sign', () => {
        expect(formatCurrency(1000)).toBe('$1,000');
    });

    it('should format large amounts with commas', () => {
        expect(formatCurrency(1234567)).toBe('$1,234,567');
    });

    it('should format zero correctly', () => {
        expect(formatCurrency(0)).toBe('$0');
    });

    it('should format amounts without decimal places', () => {
        expect(formatCurrency(99.99)).toBe('$100');
    });

    it('should handle negative amounts', () => {
        expect(formatCurrency(-500)).toBe('-$500');
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
        const result = formatTime('2024-01-01T16:45:00');
        expect(result).toMatch(/4:45 PM/i);
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

        // 1/3 = 33.33... should round to 33
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
        { month: { year: 2024, monthValue: 6, month: 'Jun' }, revenue: 6000, rentalCount: 60, growthPercentage: 0 },
        { month: { year: 2024, monthValue: 5, month: 'May' }, revenue: 5000, rentalCount: 50, growthPercentage: 0 },
        { month: { year: 2024, monthValue: 4, month: 'Apr' }, revenue: 4000, rentalCount: 40, growthPercentage: 0 },
        { month: { year: 2024, monthValue: 3, month: 'Mar' }, revenue: 3000, rentalCount: 30, growthPercentage: 0 },
        { month: { year: 2024, monthValue: 2, month: 'Feb' }, revenue: 2000, rentalCount: 20, growthPercentage: 0 },
        { month: { year: 2024, monthValue: 1, month: 'Jan' }, revenue: 1000, rentalCount: 10, growthPercentage: 0 },
        { month: { year: 2023, monthValue: 12, month: 'Dec' }, revenue: 1200, rentalCount: 12, growthPercentage: 0 },
        { month: { year: 2023, monthValue: 11, month: 'Nov' }, revenue: 1100, rentalCount: 11, growthPercentage: 0 },
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
            { month: { year: 2024, monthValue: 1, month: 'Jan' }, revenue: 100, rentalCount: 1, growthPercentage: 0 },
            { month: { year: 2023, monthValue: 12, month: 'Dec' }, revenue: 200, rentalCount: 1, growthPercentage: 0 },
        ];
        const result = processRevenueData(multiYearData);
        expect(result[0].month).toBe('Dec');
        expect(result[1].month).toBe('Jan');
    });
});