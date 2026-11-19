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

