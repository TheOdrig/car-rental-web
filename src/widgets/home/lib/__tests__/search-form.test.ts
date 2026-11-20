import { describe, expect, it } from 'vitest';
import { buildSearchQuery, validateSearchDates } from '../search-form';

const day = (value: string) => new Date(`${value}T12:00:00`);

describe('validateSearchDates', () => {
    it('requires both dates', () => {
        expect(validateSearchDates(undefined, undefined)).toEqual({
            pickupDate: 'Pickup date is required',
            returnDate: 'Return date is required',
        });
    });

    it('requires the return date after the pickup date', () => {
        expect(validateSearchDates(day('2026-12-05'), day('2026-12-05'))).toEqual({
            returnDate: 'Return date must be after pickup date',
        });
        expect(validateSearchDates(day('2026-12-05'), day('2026-12-06'))).toEqual({});
    });
});

describe('buildSearchQuery', () => {
    it('adds dates and a body type unless it is all', () => {
        expect(buildSearchQuery({ pickupDate: day('2026-12-05'), returnDate: day('2026-12-08'), vehicleType: 'SUV' })).toBe(
            'startDate=2026-12-05&endDate=2026-12-08&bodyType=SUV',
        );
        expect(buildSearchQuery({ pickupDate: undefined, returnDate: undefined, vehicleType: 'all' })).toBe('');
    });
});
