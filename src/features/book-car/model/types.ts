import type { CurrencyType } from '@/types/common';
import type { CarSummary } from '@/types/car';

export interface BookingRequest {
    carId: number;
    startDate: string;
    endDate: string;
    notes?: string;
}

export interface Booking {
    id: number;
    carSummary: CarSummary;
    startDate: string;
    endDate: string;
    days: number;
    dailyPrice: number;
    totalPrice: number;
    currency: CurrencyType;
    status: 'Requested' | 'Confirmed' | 'Cancelled';
    notes?: string;
    createTime: string;
    updateTime: string;
}

export interface AvailabilityFilters {
    startDate: string;
    endDate: string;
    brand?: string;
    transmission?: 'AUTOMATIC' | 'MANUAL';
    fuelType?: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
    minSeats?: number;
    maxDailyPrice?: number;
}

export interface AvailableCar {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
    transmission: string;
    fuelType: string;
    seats: number;
    dailyPrice: number;
    currency: CurrencyType;
    imageUrl?: string;
    isAvailable: boolean;
}

export interface BookingError {
    field?: string;
    message: string;
    code?: string;
}

export interface BookingFormData {
    carId: number;
    startDate: Date | null;
    endDate: Date | null;
    notes: string;
}

export interface BookingValidation {
    isValid: boolean;
    errors: Record<string, string>;
}
