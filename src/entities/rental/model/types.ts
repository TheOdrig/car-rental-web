import type { Schemas, WithRequired } from '@/shared/api/contract';
import type { CurrencyType, PageResponse } from '@/shared/types';
import type { UserSummary } from '@/entities/user/@x/rental';
import type { CarSummary } from '@/entities/car/@x/rental';

export enum RentalStatus {
    REQUESTED = 'REQUESTED',
    CONFIRMED = 'CONFIRMED',
    IN_USE = 'IN_USE',
    RETURNED = 'RETURNED',
    CANCELLED = 'CANCELLED',
}

export const RENTAL_STATUS_LABELS: Record<RentalStatus, string> = {
    [RentalStatus.REQUESTED]: 'Requested',
    [RentalStatus.CONFIRMED]: 'Confirmed',
    [RentalStatus.IN_USE]: 'In use',
    [RentalStatus.RETURNED]: 'Returned',
    [RentalStatus.CANCELLED]: 'Cancelled',
};
export type Rental = Omit<
    WithRequired<Schemas['RentalResponse'], 'id' | 'startDate' | 'endDate' | 'totalPrice'>,
    'status' | 'carSummary' | 'userSummary'
> & {
    status: RentalStatus;
    carSummary?: CarSummary;
    userSummary?: UserSummary;
};
export type RentalRequest = Omit<
    Schemas['RentalRequest'],
    'endDateAfterStartDate' | 'withinMaxLeadTime' | 'withinMaxRentalLength'
>;
export type PickupRequest = Schemas['PickupRequest'];
export type ReturnRequest = Schemas['ReturnRequest'];
export type LateReturnStatus =
    | 'ON_TIME'
    | 'GRACE_PERIOD'
    | 'LATE'
    | 'SEVERELY_LATE';
export const LATE_RETURN_STATUS_LABELS: Record<LateReturnStatus, string> = {
    ON_TIME: 'On time',
    GRACE_PERIOD: 'Grace period',
    LATE: 'Late',
    SEVERELY_LATE: 'Severely late',
};
export type LateReturnReport = Omit<
    WithRequired<
        Schemas['LateReturnReportDto'],
        | 'rentalId'
        | 'customerName'
        | 'customerEmail'
        | 'carBrand'
        | 'carModel'
        | 'licensePlate'
        | 'endDate'
        | 'lateHours'
        | 'lateDays'
        | 'penaltyAmount'
        | 'currency'
        | 'penaltyPaid'
    >,
    'status'
> & { status: LateReturnStatus };
export type LateReturnStatistics = Required<Schemas['LateReturnStatisticsDto']>;
export interface LateReturnFilters {
    startDate?: string;
    endDate?: string;
    status?: LateReturnStatus;
    sortBy?: 'endDate' | 'penaltyAmount' | 'lateHours';
    sortDirection?: 'ASC' | 'DESC';
}
export type PaginatedLateReturns = PageResponse<LateReturnReport>;
export type PenaltyWaiverRequest = Schemas['PenaltyWaiverRequest'];
export type PenaltyWaiverResponse = WithRequired<
    Schemas['PenaltyWaiverResponse'],
    'id' | 'rentalId' | 'originalPenalty' | 'waivedAmount' | 'remainingPenalty' | 'reason' | 'adminId' | 'waivedAt' | 'refundInitiated'
>;
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
    disabled?: boolean;
    hint?: string;
}


export type AdminRentalStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'OVERDUE';

export const ADMIN_RENTAL_STATUS_LABELS: Record<AdminRentalStatus, string> = {
    PENDING: 'Pending Approval',
    CONFIRMED: 'Confirmed',
    ACTIVE: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected',
    OVERDUE: 'Overdue',
};

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
    currency?: string;
    status: AdminRentalStatus;
}

export interface RentalVehicleInfo {
    id: number;
    brand: string;
    model: string;
    licensePlate: string;
    year?: number;
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
        spentByCurrency: { currency: string; totalSpent: number }[];
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
        currency: CurrencyType;
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
            spentByCurrency: { currency: string; totalSpent: number }[];
            damageCount: number;
        };
    };
    vehicle: {
        id: number;
        brand: string;
        model: string;
        licensePlate: string;
        year?: number;
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
    damages: Schemas['DamageReportDto'][];
    notes: {
        approval?: string;
        pickup?: string;
        return?: string;
        cancellation?: string;
    };
    penaltyAmount?: number;
    lateReturnStatus?: LateReturnStatus;
}

export type PendingItem = WithRequired<
    Schemas['PendingItemDto'],
    | 'rentalId'
    | 'customerName'
    | 'customerEmail'
    | 'carId'
    | 'carBrand'
    | 'carModel'
    | 'licensePlate'
    | 'startDate'
    | 'endDate'
    | 'totalAmount'
    | 'status'
    | 'createdAt'
>;

export interface ProcessReturnData {
    hasDamage?: boolean;
    notes?: string;
}


type RentalStatusMatchesContract = `${RentalStatus}` extends NonNullable<Schemas['RentalResponse']['status']> ? true : never;
export const rentalStatusMatchesContract: RentalStatusMatchesContract = true;
