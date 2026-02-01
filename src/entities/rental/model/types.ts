import { CurrencyType } from '@/shared/types';
import { UserSummary } from '@/entities/user';
import { CarSummary } from '@/entities/car';

export enum RentalStatus {
    REQUESTED = 'Requested',
    CONFIRMED = 'Confirmed',
    ACTIVE = 'In Use',
    COMPLETED = 'Returned',
    CANCELLED = 'Cancelled',
}
export interface Rental {
    id: number;
    userId?: number;
    carId?: number;
    carSummary?: CarSummary;
    userSummary?: UserSummary;
    startDate: string;
    endDate: string;
    days?: number;
    dailyPrice?: number;
    totalPrice: number;
    currency?: CurrencyType;
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
    approvalNotes?: string;
    cancellationReason?: string;
    createTime?: string;
    updateTime?: string;
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
    | 'ON_TIME'
    | 'GRACE_PERIOD'
    | 'LATE'
    | 'SEVERELY_LATE';
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
export interface LateReturnFilters {
    startDate?: string;
    endDate?: string;
    status?: LateReturnStatus;
    sortBy?: 'endDate' | 'penaltyAmount' | 'lateHours';
    sortDirection?: 'ASC' | 'DESC';
}
export interface PaginatedLateReturns {
    content: LateReturnReport[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
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
}
export interface ActionButton {
    label: string;
    action: string;
    variant: 'default' | 'outline' | 'ghost' | 'destructive';
    icon?: string;
}


export type AdminRentalStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'OVERDUE';

export interface RentalHistoryItem {
    id: number;
    customerId?: number;
    customerName: string;
    carId?: number;
    vehicleName: string;
    startDate: string;
    endDate: string;
    duration: number;
    totalAmount: number;
    status: AdminRentalStatus;
}

export interface RentalVehicleInfo {
    id: number;
    brand: string;
    model: string;
    licensePlate: string;
    year: number;
    thumbnailUrl?: string;
    imageUrl?: string;
    fuelType?: string;
    transmissionType?: string;
    status: string;
}

export interface RentalCustomerInfo {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isVerified: boolean;
    stats: {
        totalRentals: number;
        totalSpent: number;
        damageCount: number;
    };
}

export interface RentalPricing {
    dailyRate: number;
    totalDays: number;
    subtotal: number;
    discounts: number;
    finalTotal: number;
    currency: string;
    exchangeRate?: number;
}

export interface RentalPaymentInfo {
    id: number;
    method: string;
    status: string;
    transactionId: string;
    paymentIntentId?: string;
    last4: string;
    paidAt: string;
}

export type TimelineEventType = 'created' | 'approved' | 'rejected' | 'cancelled' | 'picked_up' | 'returned' | 'note_added';

export interface TimelineEvent {
    id: number;
    type: TimelineEventType;
    title: string;
    description: string;
    timestamp: string;
    adminName?: string;
    notes?: string;
}

export interface RentalDetailResponse {
    id: number;
    status: AdminRentalStatus;
    startDate: string;
    endDate: string;
    duration: number;
    pricing: {
        dailyRate: number;
        totalDays: number;
        subtotal: number;
        discounts: number;
        finalTotal: number;
        currency: 'USD' | 'EUR' | 'TRY';
    };
    customer: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        emailVerified: boolean;
        phoneVerified: boolean;
        stats: {
            totalRentals: number;
            totalSpent: number;
            damageCount: number;
        };
    };
    vehicle: {
        id: number;
        brand: string;
        model: string;
        licensePlate: string;
        imageUrl?: string;
        status: string;
        fuelType: string;
        transmissionType: string;
        bodyType?: string;
    };
    payment: {
        totalAmount: number;
        status: string;
        method: string;
    };
    timeline: {
        type: string;
        timestamp: string;
        title?: string;
        description?: string;
    }[];
    damages: import('@/entities/damage').DamageReport[];
    notes: {
        approval?: string;
        pickup?: string;
        return?: string;
        cancellation?: string;
    };
    penaltyAmount?: number;
    lateReturnStatus?: LateReturnStatus;
}

export interface PendingItem {
    rentalId: number;
    customerId?: number;
    customerName: string;
    customerEmail: string;
    customerImage?: string;
    isCustomerVerified?: boolean;
    carId: number;
    carBrand: string;
    carModel: string;
    carImage?: string;
    licensePlate: string;
    fuelType?: string;
    transmission?: string;
    startDate: string;
    endDate: string;
    duration?: number;
    totalAmount: number;
    status: string;
    lateHours?: number;
    createdAt: string;
}

export interface ProcessReturnData {
    hasDamage?: boolean;
    notes?: string;
}
