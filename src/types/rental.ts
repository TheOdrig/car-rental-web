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
    approvalNotes?: string;
    cancellationReason?: string;
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

export function getLateReturnStatusColor(status: LateReturnStatus): string {
    const colors: Record<LateReturnStatus, string> = {
        ON_TIME: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        GRACE_PERIOD: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        LATE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        SEVERELY_LATE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status];
}

export function getLateReturnStatusLabel(status: LateReturnStatus): string {
    const labels: Record<LateReturnStatus, string> = {
        ON_TIME: 'On Time',
        GRACE_PERIOD: 'Grace Period',
        LATE: 'Late',
        SEVERELY_LATE: 'Severely Late',
    };
    return labels[status];
}

export function formatLateTime(lateHours: number): string {
    if (lateHours < 24) {
        return `${lateHours}h`;
    }
    const days = Math.floor(lateHours / 24);
    const hours = lateHours % 24;
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
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

