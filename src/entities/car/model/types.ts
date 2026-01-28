export enum CarStatus {
    AVAILABLE = 'AVAILABLE',
    RENTED = 'RENTED',
    MAINTENANCE = 'MAINTENANCE',
}

export enum FuelType {
    GASOLINE = 'GASOLINE',
    DIESEL = 'DIESEL',
    ELECTRIC = 'ELECTRIC',
    HYBRID = 'HYBRID',
}

export enum TransmissionType {
    MANUAL = 'MANUAL',
    AUTOMATIC = 'AUTOMATIC',
}

export interface Car {
    id: number;
    brand: string;
    model: string;
    year: number;
    color: string;
    dailyPrice: number;
    status: CarStatus;
    imageUrl: string;
    fuelType: FuelType;
    transmission: TransmissionType;
    location?: string;
    mileage?: number;
}
