import { Rental, RentalStatus } from '../model/types';
import { formatCurrency, formatDate } from '@/shared/lib/format';

export const isActive = (rental: Rental): boolean => {
    return rental.status === RentalStatus.ACTIVE;
};

export const canCancel = (rental: Rental): boolean => {
    return (
        rental.status === RentalStatus.PENDING ||
        rental.status === RentalStatus.CONFIRMED
    );
};

export const getFormattedRentalPeriod = (rental: Rental): string => {
    return `${formatDate(rental.startDate)} - ${formatDate(rental.endDate)}`;
};

export const getFormattedTotal = (rental: Rental): string => {
    return formatCurrency(rental.totalPrice);
};
