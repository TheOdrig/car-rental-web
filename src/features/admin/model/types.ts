import type { Schemas, WithRequired } from '@/shared/api/contract';
import type { PageResponse } from '@/shared/types';
import type {
    FleetStatus,
    VehicleStatistics,
    VehicleImages,
    VehicleCurrentStatus,
    VehicleActiveRental,
    VehicleDetailResponse,
} from '@/entities/car';
import type {
    PendingItem,
    AdminRentalStatus,
    RentalHistoryItem,
    RentalDetailResponse,
    RentalVehicleInfo,
    RentalCustomerInfo,
    RentalPricing,
    RentalPaymentInfo,
    TimelineEvent,
    TimelineEventType,
} from '@/entities/rental';
import type {
    CustomerStatistics,
    CustomerVerification,
    CustomerAccountStatus,
    CustomerDetailResponse,
    AdminNote,
    DocumentVerificationStatus,
    AccountStatusType,
    Role,
} from '@/entities/user';


export type {
    FleetStatus,
    VehicleStatistics,
    VehicleImages,
    VehicleCurrentStatus,
    VehicleActiveRental,
    VehicleDetailResponse,
    AdminRentalStatus,
    RentalHistoryItem,
    RentalDetailResponse,
    RentalVehicleInfo,
    RentalCustomerInfo,
    RentalPricing,
    RentalPaymentInfo,
    TimelineEvent,
    TimelineEventType,
    CustomerStatistics,
    CustomerVerification,
    CustomerAccountStatus,
    CustomerDetailResponse,
    AdminNote,
    DocumentVerificationStatus,
    AccountStatusType,
    Role,
};

export interface TrendIndicator {
    value: number;
    direction: 'up' | 'down';
    label?: string;
}

export type DailySummary = Required<Schemas['DailySummaryDto']>;

export type MonthlyMetrics = Required<Schemas['MonthlyMetricsDto']>;

export type AlertType = NonNullable<Schemas['AlertDto']['type']>;

export type AlertSeverity = NonNullable<Schemas['AlertDto']['severity']>;

export type Alert = WithRequired<Schemas['AlertDto'], 'id' | 'type' | 'severity' | 'title' | 'message' | 'acknowledged' | 'createdAt'>;

export type { PendingItem };

export type QuickActionResult = WithRequired<Schemas['QuickActionResultDto'], 'success' | 'message'>;

export interface ProcessReturnData {
    hasDamage?: boolean;
    notes?: string;
}

export type DailyRevenue = Required<Schemas['DailyRevenueDto']>;

export interface MonthlyRevenue {
    month: string;
    revenue: number;
    rentalCount: number;
    growthPercentage: number;
}

export type RevenueBreakdown = Required<Schemas['RevenueBreakdownDto']>;

export type RevenuePeriod = 'last6months' | 'lastyear';

export interface RevenueDataPoint {
    month: string;
    revenue: number;
    isCurrent?: boolean;
}

export interface RevenueAnalytics {
    dailyRevenue: DailyRevenue[];
    monthlyRevenue: MonthlyRevenue[];
    breakdown: RevenueBreakdown;
    generatedAt: string;
}

export type AlertVariant = 'critical' | 'warning' | 'info' | 'success';

export interface AdminAlertAction {
    label: string;
    action: string;
    variant?: 'default' | 'outline' | 'ghost';
}

export interface AdminAlert {
    id: string;
    type: AlertVariant;
    title: string;
    description: string;
    timestamp: string;
    actions?: AdminAlertAction[];
    dismissible?: boolean;
}

export type PaginatedResponse<T> = PageResponse<T>;