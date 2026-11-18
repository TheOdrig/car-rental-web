import { describe, it, expect} from 'vitest';
import { calculateRentalDays, formatPhoneNumber, validatePhoneNumber } from '@/features/book-car';
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
    describe('formatPhoneNumber', () => {
        it('should format 10-digit US phone numbers', () => {
            expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
        });
        it('should format 11-digit US phone numbers with country code', () => {
            expect(formatPhoneNumber('15551234567')).toBe('+1 (555) 123-4567');
        });
        it('should return original for non-standard formats', () => {
            expect(formatPhoneNumber('+44 20 1234 5678')).toBe('+44 20 1234 5678');
        });
    });
    describe('validatePhoneNumber', () => {
        it('should accept valid phone numbers', () => {
            expect(validatePhoneNumber('5551234567')).toBe(true);
            expect(validatePhoneNumber('+1-555-123-4567')).toBe(true);
            expect(validatePhoneNumber('+44 20 1234 5678')).toBe(true);
        });
        it('should reject too short phone numbers', () => {
            expect(validatePhoneNumber('123456')).toBe(false);
        });
        it('should reject too long phone numbers', () => {
            expect(validatePhoneNumber('1234567890123456')).toBe(false);
        });
    });
});