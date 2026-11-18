import { describe, it, expect } from 'vitest';
import { validateDateRange } from '../date-validation';

const now = new Date(2026, 10, 18, 9, 0);

describe('validateDateRange', () => {
    it('accepts a normal booking', () => {
        expect(validateDateRange(new Date(2026, 10, 20), new Date(2026, 10, 25), now)).toBeNull();
    });

    it('rejects more than 30 days', () => {
        expect(validateDateRange(new Date(2026, 10, 20), new Date(2026, 11, 25), now)).toBe(
            'Rental cannot be longer than 30 days'
        );
    });

    it('rejects a start more than 180 days ahead', () => {
        expect(validateDateRange(new Date(2027, 5, 1), new Date(2027, 5, 3), now)).toBe(
            'Start date cannot be more than 180 days ahead'
        );
    });

    it('rejects an end that is not after the start', () => {
        expect(validateDateRange(new Date(2026, 10, 25), new Date(2026, 10, 25), now)).toBe(
            'End date must be after start date'
        );
    });
});
