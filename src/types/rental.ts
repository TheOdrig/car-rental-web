import { CurrencyType } from './common';
import { CarSummary } from './car';
import { UserSummary } from './auth';

export type RentalStatus =
    | 'Requested'
    | 'Confirmed'
    | 'In Use'
    | 'Returned'
    | 'Cancelled';

export interface Rental {
    id: number;
    carSummary: CarSummary;
    userSummary: UserSummary;
    startDate: string;
    endDate: string;
    days: number;
    dailyPrice: number;
    totalPrice: number;
    currency: CurrencyType;
    status: RentalStatus;

    originalPrice?: number;
    finalPrice?: number;
    totalSavings?: number;
    appliedDiscounts?: string[];

    convertedTotalPrice?: number;
    displayCurrency?: CurrencyType;
    exchangeRate?: number;
    rateSource?: string;

    pickupNotes?: string;
    returnNotes?: string;
    createTime: string;
    updateTime: string;
}

export interface RentalRequest {
    carId: number;
    startDate: string;
    endDate: string;
    notes?: string;
}

export interface PickupRequest {
    notes?: string;
}

export interface ReturnRequest {
    notes?: string;
}

export interface PricingRequest {
    carId: number;
    startDate: string;
    endDate: string;
}

export interface PricingModifier {
    strategyName: string;
    multiplier: number;
    description: string;
    isDiscount: boolean;
    formattedPercentage: string;
}

export interface PricingResponse {
    basePrice: number;
    baseTotalPrice: number;
    finalPrice: number;
    effectiveDailyPrice: number;
    totalSavings: number;
    combinedMultiplier: number;
    rentalDays: number;
    appliedModifiers: PricingModifier[];
}

export type LateReturnStatus =
    | 'On Time'
    | 'Grace Period'
    | 'Late'
    | 'Severely Late';

export interface LateReturnReport {
    rentalId: number;
    customerName: string;
    customerEmail: string;
    carBrand: string;
    carModel: string;
    licensePlate: string;
    endDate: string;
    actualReturnTime?: string;
    lateHours: number;
    lateDays: number;
    status: LateReturnStatus;
    penaltyAmount: number;
    currency: CurrencyType;
    penaltyPaid: boolean;
}

export interface LateReturnStatistics {
    totalLateReturns: number;
    severelyLateCount: number;
    totalPenaltyAmount: number;
    collectedPenaltyAmount: number;
    pendingPenaltyAmount: number;
    averageLateHours: number;
    lateReturnPercentage: number;
}

export interface PenaltyWaiverRequest {
    waiverAmount?: number;
    reason: string;
    fullWaiver?: boolean;
}

export interface PenaltyWaiverResponse {
    id: number;
    rentalId: number;
    originalPenalty: number;
    waivedAmount: number;
    remainingPenalty: number;
    reason: string;
    adminId: number;
    waivedAt: string;
    refundInitiated: boolean;
    refundTransactionId?: string;
}

export type RentalTab = 'all' | 'active' | 'upcoming' | 'completed' | 'cancelled';


export interface RentalTabCounts {
    all: number;
    active: number;
    upcoming: number;
    completed: number;
    cancelled: number;
}

export interface RentalStats {
    totalRentals: number;
    activeTrips: number;
    loyaltyPoints: number;
}

export interface ActionButton {
    label: string;
    action: string;
    variant: 'default' | 'outline' | 'ghost' | 'destructive';
    icon?: string;
}
