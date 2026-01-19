export interface TrendIndicator {
    value: number;
    direction: 'up' | 'down';
    label?: string;
}

export interface DailySummary {
    pendingApprovals: number;
    todaysPickups: number;
    todaysReturns: number;
    overdueRentals: number;
    pendingDamageAssessments: number;
    generatedAt: string;
}

export interface FleetStatus {
    totalCars: number;
    availableCars: number;
    rentedCars: number;
    reservedCars: number;
    maintenanceCars: number;
    inspectionCars: number;
    damagedCars: number;
    soldCars?: number;
    occupancyRate: number;
    generatedAt: string;
}

export interface MonthlyMetrics {
    totalRevenue: number;
    completedRentals: number;
    cancelledRentals: number;
    penaltyRevenue: number;
    damageCharges: number;
    averageRentalDurationDays: number;
    startDate: string;
    endDate: string;
    generatedAt: string;
}

export type AlertType =
    | 'LATE_RETURN'
    | 'FAILED_PAYMENT'
    | 'LOW_AVAILABILITY'
    | 'UNRESOLVED_DISPUTE'
    | 'MAINTENANCE_REQUIRED';

export type AlertSeverity =
    | 'CRITICAL'
    | 'HIGH'
    | 'WARNING'
    | 'MEDIUM'
    | 'LOW';

export interface Alert {
    id: number;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    actionUrl?: string;
    acknowledged: boolean;
    acknowledgedAt?: string;
    acknowledgedBy?: string;
    createdAt: string;
}

export interface PendingItem {
    rentalId: number;
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

export interface QuickActionResult {
    success: boolean;
    message: string;
    newStatus?: string;
    updatedSummary?: DailySummary;
}

export interface ProcessReturnData {
    hasDamage?: boolean;
    notes?: string;
}

export interface DailyRevenue {
    date: string;
    revenue: number;
    rentalCount: number;
}

export interface MonthlyRevenue {
    month: {
        year: number;
        monthValue: number;
        month: string;
    };
    revenue: number;
    rentalCount: number;
    growthPercentage: number;
}

export interface RevenueBreakdown {
    rentalRevenue: number;
    penaltyRevenue: number;
    damageRecovered: number;
    damageRepairCosts: number;
    netDamageImpact: number;
    totalRevenue: number;
    netRevenue: number;
    rentalPercentage: number;
    penaltyPercentage: number;
    damagePercentage: number;
}

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


