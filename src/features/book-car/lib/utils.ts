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

export function formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length === 10) {
        return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
    }

    if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
        return `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
    }

    return phone;
}

export function validatePhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 7 && cleanPhone.length <= 15;
}
