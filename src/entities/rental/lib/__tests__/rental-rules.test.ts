import { describe, it, expect } from 'vitest';
import {
    MAX_LEAD_DAYS,
    MAX_RENTAL_DAYS,
    RENTAL_MESSAGES,
    addCalendarDays,
    createRentalDatesSchema,
    findRentalDateIssue,
    getEndDateRange,
    getStartDateRange,
    isEndDateDisabled,
    isStartDateDisabled,
    parseLocalDate,
    rentalLengthInDays,
    toDateInputValue,
    validateRentalDates,
} from '../rental-rules';

const now = new Date(2026, 10, 18, 15, 30);
const today = new Date(2026, 10, 18);

function day(offset: number): Date {
    return addCalendarDays(today, offset);
}

describe('rental rules', () => {
    describe('validateRentalDates', () => {
        it('accepts a short rental starting today', () => {
            expect(validateRentalDates(day(0), day(3), now)).toBeNull();
        });

        it('accepts a rental of exactly 30 days inclusive', () => {
            expect(rentalLengthInDays(day(1), day(30))).toBe(MAX_RENTAL_DAYS);
            expect(validateRentalDates(day(1), day(30), now)).toBeNull();
        });

        it('rejects a rental longer than 30 days', () => {
            expect(validateRentalDates(day(1), day(31), now)).toBe(RENTAL_MESSAGES.tooLong);
        });

        it('accepts a start date exactly 180 days ahead', () => {
            expect(validateRentalDates(day(MAX_LEAD_DAYS), day(MAX_LEAD_DAYS + 2), now)).toBeNull();
        });

        it('rejects a start date more than 180 days ahead', () => {
            expect(validateRentalDates(day(MAX_LEAD_DAYS + 1), day(MAX_LEAD_DAYS + 3), now)).toBe(
                RENTAL_MESSAGES.tooFarAhead
            );
        });

        it('rejects an end date equal to or before the start date', () => {
            expect(validateRentalDates(day(2), day(2), now)).toBe(RENTAL_MESSAGES.endBeforeStart);
            expect(validateRentalDates(day(5), day(2), now)).toBe(RENTAL_MESSAGES.endBeforeStart);
        });

        it('rejects a start date in the past', () => {
            expect(validateRentalDates(day(-1), day(2), now)).toBe(RENTAL_MESSAGES.startInPast);
        });

        it('reports the field that caused the issue', () => {
            expect(findRentalDateIssue(day(1), day(40), now)?.field).toBe('endDate');
            expect(findRentalDateIssue(day(200), day(201), now)?.field).toBe('startDate');
        });

        it('uses the same message text as the API', () => {
            expect(RENTAL_MESSAGES.tooLong).toBe('Rental cannot be longer than 30 days');
            expect(RENTAL_MESSAGES.tooFarAhead).toBe('Start date cannot be more than 180 days ahead');
            expect(RENTAL_MESSAGES.endBeforeStart).toBe('End date must be after start date');
        });
    });

    describe('date picker ranges', () => {
        it('limits the start date to today through 180 days ahead', () => {
            expect(isStartDateDisabled(day(-1), now)).toBe(true);
            expect(isStartDateDisabled(day(0), now)).toBe(false);
            expect(isStartDateDisabled(day(180), now)).toBe(false);
            expect(isStartDateDisabled(day(181), now)).toBe(true);
        });

        it('limits the end date to the day after the start through 29 days later', () => {
            const start = day(10);
            expect(isEndDateDisabled(day(10), start, now)).toBe(true);
            expect(isEndDateDisabled(day(11), start, now)).toBe(false);
            expect(isEndDateDisabled(day(39), start, now)).toBe(false);
            expect(isEndDateDisabled(day(40), start, now)).toBe(true);
        });

        it('allows the widest end range before a start date is chosen', () => {
            const range = getEndDateRange(undefined, now);
            expect(range.min).toEqual(day(1));
            expect(range.max).toEqual(day(180 + 29));
            expect(getStartDateRange(now).max).toEqual(day(180));
        });

        it('formats and parses date input values in local time', () => {
            expect(toDateInputValue(new Date(2026, 0, 5))).toBe('2026-01-05');
            expect(parseLocalDate('2026-01-05')).toEqual(new Date(2026, 0, 5));
            expect(parseLocalDate('2026-02-31')).toBeNull();
            expect(parseLocalDate('nope')).toBeNull();
        });
    });

    describe('createRentalDatesSchema', () => {
        const schema = createRentalDatesSchema(now);

        it('accepts valid dates', () => {
            expect(schema.safeParse({ startDate: '2026-11-20', endDate: '2026-11-25' }).success).toBe(true);
        });

        it('rejects a rental longer than 30 days on the end date', () => {
            const result = schema.safeParse({ startDate: '2026-11-20', endDate: '2026-12-25' });
            expect(result.success).toBe(false);
            const issue = !result.success ? result.error.issues[0] : null;
            expect(issue?.message).toBe(RENTAL_MESSAGES.tooLong);
            expect(issue?.path).toEqual(['endDate']);
        });

        it('rejects a start date more than 180 days ahead on the start date', () => {
            const result = schema.safeParse({ startDate: '2027-06-01', endDate: '2027-06-03' });
            expect(result.success).toBe(false);
            const issue = !result.success ? result.error.issues[0] : null;
            expect(issue?.message).toBe(RENTAL_MESSAGES.tooFarAhead);
            expect(issue?.path).toEqual(['startDate']);
        });

        it('rejects an end date that is not after the start date', () => {
            const result = schema.safeParse({ startDate: '2026-11-25', endDate: '2026-11-25' });
            expect(result.success).toBe(false);
            expect(!result.success && result.error.issues[0].message).toBe(RENTAL_MESSAGES.endBeforeStart);
        });

        it('rejects malformed dates', () => {
            const result = schema.safeParse({ startDate: '20/11/2026', endDate: '2026-11-25' });
            expect(result.success).toBe(false);
        });
    });
});
