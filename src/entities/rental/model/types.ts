export enum RentalStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface Rental {
    id: number;
    userId: number;
    carId: number;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: RentalStatus;
}
