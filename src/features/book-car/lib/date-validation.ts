export function validateDateRange(startDate: Date, endDate: Date): string | null {
    if (startDate >= endDate) {
        return 'End date must be after start date';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
        return 'Start date cannot be in the past';
    }

    const maxDate = new Date(today);
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    if (endDate > maxDate) {
        return 'Booking cannot be more than 1 year in advance';
    }

    return null;
}

export function calculateDays(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}