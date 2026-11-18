import { z } from 'zod';

export const MAX_RENTAL_DAYS = 30;
export const MAX_LEAD_DAYS = 180;
export const MAX_OPEN_REQUESTS = 3;

export const RENTAL_MESSAGES = {
    startInPast: 'Start date cannot be in the past',
    endBeforeStart: 'End date must be after start date',
    tooFarAhead: `Start date cannot be more than ${MAX_LEAD_DAYS} days ahead`,
    tooLong: `Rental cannot be longer than ${MAX_RENTAL_DAYS} days`,
    invalidDate: 'Please enter a valid date',
} as const;

export type RentalDateField = 'startDate' | 'endDate';

export interface RentalDateIssue {
    field: RentalDateField;
    message: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function dayStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addCalendarDays(date: Date, days: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function diffCalendarDays(later: Date, earlier: Date): number {
    const a = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate());
    const b = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());
    return Math.round((a - b) / MS_PER_DAY);
}

export function parseLocalDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return null;
    }
    return date;
}

export function toDateInputValue(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

export function rentalLengthInDays(start: Date, end: Date): number {
    return diffCalendarDays(end, start) + 1;
}

export function findRentalDateIssue(start: Date, end: Date, now: Date = new Date()): RentalDateIssue | null {
    const today = dayStart(now);

    if (dayStart(start) < today) {
        return { field: 'startDate', message: RENTAL_MESSAGES.startInPast };
    }
    if (diffCalendarDays(end, start) <= 0) {
        return { field: 'endDate', message: RENTAL_MESSAGES.endBeforeStart };
    }
    if (diffCalendarDays(start, today) > MAX_LEAD_DAYS) {
        return { field: 'startDate', message: RENTAL_MESSAGES.tooFarAhead };
    }
    if (rentalLengthInDays(start, end) > MAX_RENTAL_DAYS) {
        return { field: 'endDate', message: RENTAL_MESSAGES.tooLong };
    }
    return null;
}

export function validateRentalDates(start: Date, end: Date, now: Date = new Date()): string | null {
    return findRentalDateIssue(start, end, now)?.message ?? null;
}

export function getStartDateRange(now: Date = new Date()): { min: Date; max: Date } {
    const min = dayStart(now);
    return { min, max: addCalendarDays(min, MAX_LEAD_DAYS) };
}

export function getEndDateRange(start: Date | undefined, now: Date = new Date()): { min: Date; max: Date } {
    const range = getStartDateRange(now);
    if (!start) {
        return { min: addCalendarDays(range.min, 1), max: addCalendarDays(range.max, MAX_RENTAL_DAYS - 1) };
    }
    const from = dayStart(start);
    return { min: addCalendarDays(from, 1), max: addCalendarDays(from, MAX_RENTAL_DAYS - 1) };
}

export function isStartDateDisabled(date: Date, now: Date = new Date()): boolean {
    const { min, max } = getStartDateRange(now);
    const day = dayStart(date);
    return day < min || day > max;
}

export function isEndDateDisabled(date: Date, start: Date | undefined, now: Date = new Date()): boolean {
    const { min, max } = getEndDateRange(start, now);
    const day = dayStart(date);
    return day < min || day > max;
}

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, RENTAL_MESSAGES.invalidDate);

export function createRentalDatesSchema(now?: Date) {
    return z
        .object({ startDate: dateStringSchema, endDate: dateStringSchema })
        .superRefine((value, ctx) => {
            const start = parseLocalDate(value.startDate);
            const end = parseLocalDate(value.endDate);
            if (!start || !end) {
                if (!start) {
                    ctx.addIssue({ code: 'custom', path: ['startDate'], message: RENTAL_MESSAGES.invalidDate });
                }
                if (!end) {
                    ctx.addIssue({ code: 'custom', path: ['endDate'], message: RENTAL_MESSAGES.invalidDate });
                }
                return;
            }
            const issue = findRentalDateIssue(start, end, now ?? new Date());
            if (issue) {
                ctx.addIssue({ code: 'custom', path: [issue.field], message: issue.message });
            }
        });
}

export const rentalDatesSchema = createRentalDatesSchema();

export type RentalDatesInput = z.infer<typeof rentalDatesSchema>;
