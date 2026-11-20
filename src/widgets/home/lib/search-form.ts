import { format } from 'date-fns';

export interface SearchFormValues {
    pickupDate: Date | undefined;
    returnDate: Date | undefined;
    vehicleType: string;
}

export function validateSearchDates(pickupDate: Date | undefined, returnDate: Date | undefined): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!pickupDate) errors.pickupDate = 'Pickup date is required';
    if (!returnDate) errors.returnDate = 'Return date is required';
    if (pickupDate && returnDate && pickupDate >= returnDate) errors.returnDate = 'Return date must be after pickup date';
    return errors;
}

export function buildSearchQuery({ pickupDate, returnDate, vehicleType }: SearchFormValues): string {
    const params = new URLSearchParams();
    if (pickupDate) params.set('startDate', format(pickupDate, 'yyyy-MM-dd'));
    if (returnDate) params.set('endDate', format(returnDate, 'yyyy-MM-dd'));
    if (vehicleType && vehicleType !== 'all') params.set('bodyType', vehicleType);
    return params.toString();
}
