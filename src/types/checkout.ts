import type { CardType } from './payment';
import type { CurrencyType } from './common';

export interface CheckoutFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;

    cardNumber: string;
    expiryDate: string;
    cvc: string;
    cardholderName: string;

    addons: string[];
}

export interface Addon {
    id: string;
    name: string;
    description: string;
    pricePerDay: number;
    icon?: string;
    popular?: boolean;
}

export interface PriceBreakdown {
    rentalDays: number;
    dailyRate: number;
    rentalCost: number;
    taxesAndFees: number;
    addonsCost: number;
    addonsDetail: AddonCostDetail[];
    total: number;
    currency: CurrencyType;
}

export interface AddonCostDetail {
    name: string;
    cost: number;
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

export interface PaymentError {
    code: PaymentErrorCode;
    message: string;
    details?: string;
}

export type PaymentErrorCode =
    | 'card_declined'
    | 'insufficient_funds'
    | 'expired_card'
    | 'invalid_cvc'
    | 'processing_error'
    | 'timeout';

export interface CreateBookingRequest {
    carId: number;
    startDate: string;
    endDate: string;
    pickupLocation: string;
    dropoffLocation: string;
    addons: string[];
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export interface CheckoutSearchParams {
    carId: string;
    startDate: string;
    endDate: string;
    pickupLocation?: string;
    dropoffLocation?: string;
}

export type { CardType };
