import { describe, it, expect} from 'vitest';
import { calculateRentalDays } from '@/features/book-car';
describe('checkout-utils', () => {
    describe('calculateRentalDays', () => {
        it('should count calendar days inclusively like the API', () => {
            const start = new Date('2025-01-01');
            const end = new Date('2025-01-05');
            expect(calculateRentalDays(start, end)).toBe(5);
        });
        it('should count two consecutive dates as two days', () => {
            expect(calculateRentalDays(new Date(2025, 0, 1), new Date(2025, 0, 2))).toBe(2);
        });
        it('should ignore the time of day', () => {
            expect(calculateRentalDays(new Date(2025, 0, 1, 23, 30), new Date(2025, 0, 3, 1, 0))).toBe(3);
        });
        it('should count a 30 day rental as 30 days', () => {
            expect(calculateRentalDays(new Date(2025, 0, 1), new Date(2025, 0, 30))).toBe(30);
        });
        it('should return 1 for same day rental', () => {
            const sameDay = new Date('2025-01-01');
            expect(calculateRentalDays(sameDay, sameDay)).toBe(1);
        });
        it('should return minimum 1 day', () => {
            const start = new Date('2025-01-05');
            const end = new Date('2025-01-01');
            expect(calculateRentalDays(start, end)).toBe(1);
        });
    });
});

describe('monthKeysBetween', () => {
    it('lists every month in the range and drops past months', async () => {
        const { monthKeysBetween } = await import('../utils');
        const now = new Date(2026, 10, 15);

        expect(monthKeysBetween(new Date(2026, 10, 28), new Date(2027, 0, 3), now)).toEqual(['2026-11', '2026-12', '2027-01']);
        expect(monthKeysBetween(new Date(2026, 8, 1), new Date(2026, 10, 3), now)).toEqual(['2026-11']);
    });
});
