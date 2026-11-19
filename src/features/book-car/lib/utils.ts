import {
    CAR_BOOKED_MESSAGE,
    CAR_NOT_AVAILABLE_CODE,
    getRentalRequestErrorMessage,
    rentalLengthInDays,
} from '@/entities/rental';

export function calculateRentalDays(startDate: Date, endDate: Date): number {
    return Math.max(rentalLengthInDays(startDate, endDate), 1);
}

export { CAR_BOOKED_MESSAGE, CAR_NOT_AVAILABLE_CODE };

export function getBookingErrorMessage(error: unknown): string {
    return getRentalRequestErrorMessage(error, 'Failed to create booking');
}


export function monthKeysBetween(start: Date, end: Date, now: Date = new Date()): string[] {
    const keys: string[] = [];
    const key = (year: number, month: number) => `${year}-${String(month + 1).padStart(2, '0')}`;
    const floor = key(now.getFullYear(), now.getMonth());
    let year = start.getFullYear();
    let month = start.getMonth();

    while (year < end.getFullYear() || (year === end.getFullYear() && month <= end.getMonth())) {
        const current = key(year, month);
        if (current >= floor) keys.push(current);
        month += 1;
        if (month > 11) {
            month = 0;
            year += 1;
        }
    }

    return keys;
}
