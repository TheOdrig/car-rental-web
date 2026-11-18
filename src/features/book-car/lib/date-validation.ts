import { validateRentalDates } from '@/entities/rental';

export function validateDateRange(startDate: Date, endDate: Date, now: Date = new Date()): string | null {
    return validateRentalDates(startDate, endDate, now);
}

export function calculateDays(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
