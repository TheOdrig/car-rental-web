import type { RentalRequest } from '@/entities/rental';
import type { CurrencyType } from '@/shared/types';


export interface Addon {
    id: string;
    name: string;
    description: string;
    pricePerDay: number;
    icon?: string;
    popular?: boolean;
}

export interface DiscountDetail {
    name: string;
    description: string;
    percentage: string;
    isDiscount: boolean;
}

export interface PriceBreakdown {
    rentalDays: number;
    dailyRate: number;
    originalDailyRate?: number;
    total: number;
    originalTotal?: number;
    totalSavings?: number;
    appliedDiscounts?: DiscountDetail[];
    currency: CurrencyType;
    isEstimate?: boolean;
}

export interface BookingConfirmation {
    referenceNumber: string;
    status: BookingStatus;
    car: BookingCarInfo;
    dates: BookingDates;
    locations: BookingLocations;
    payment: BookingPaymentInfo;
    addons: Addon[];
    createdAt: string;
}

export type BookingStatus = 'confirmed' | 'pending' | 'failed';

export interface BookingCarInfo {
    id: number;
    name: string;
    image: string;
    category: string;
}

export interface BookingDates {
    start: string;
    end: string;
    days: number;
}

export interface BookingLocations {
    pickup: string;
    dropoff: string;
}

export interface BookingPaymentInfo {
    total: number;
    currency: CurrencyType;
    method: string;
    last4: string;
}

export type CreateBookingRequest = RentalRequest;

export interface CheckoutSearchParams {
    carId: string;
    startDate: string;
    endDate: string;
}