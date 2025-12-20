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
    maintenanceCars: number;
    damagedCars: number;
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
    carId: number;
    carBrand: string;
    carModel: string;
    licensePlate: string;
    startDate: string;
    endDate: string;
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
    damageCharges: number;
    totalRevenue: number;
    rentalPercentage: number;
    penaltyPercentage: number;
    damagePercentage: number;
}

export interface RevenueAnalytics {
    dailyRevenue: DailyRevenue[];
    monthlyRevenue: MonthlyRevenue[];
    breakdown: RevenueBreakdown;
    generatedAt: string;
}

export type DamageSeverity =
    | 'MINOR'
    | 'MODERATE'
    | 'MAJOR'
    | 'TOTAL_LOSS';

export type DamageCategory =
    | 'SCRATCH'
    | 'DENT'
    | 'GLASS_DAMAGE'
    | 'TIRE_DAMAGE'
    | 'INTERIOR_DAMAGE'
    | 'MECHANICAL_DAMAGE';

export type DamageStatus =
    | 'REPORTED'
    | 'UNDER_ASSESSMENT'
    | 'ASSESSED'
    | 'CHARGED'
    | 'DISPUTED'
    | 'RESOLVED';

export interface DamagePhoto {
    id: number;
    fileName: string;
    secureUrl: string;
    fileSize: number;
    uploadedAt: string;
}

export interface DamageReport {
    id: number;
    rentalId: number;
    carId: number;
    carLicensePlate: string;
    customerName: string;
    description: string;
    damageLocation?: string;
    severity: DamageSeverity;
    category: DamageCategory;
    status: DamageStatus;
    repairCostEstimate?: number;
    customerLiability?: number;
    insuranceCoverage: boolean;
    reportedAt: string;
    assessedAt?: string;
    photos?: DamagePhoto[];
}

export interface DamageStatistics {
    totalDamages: number;
    minorCount: number;
    moderateCount: number;
    majorCount: number;
    totalLossCount: number;
    totalRepairCost: number;
    totalCustomerLiability: number;
    averageRepairCost: number;
    disputedCount: number;
    resolvedCount: number;
}

export interface DamageAssessmentRequest {
    severity: DamageSeverity;
    category: DamageCategory;
    repairCostEstimate: number;
    insuranceCoverage?: boolean;
    insuranceDeductible?: number;
    assessmentNotes?: string;
}

export interface DamageDisputeRequest {
    reason: string;
    comments?: string;
}

export interface DamageDisputeResolution {
    adjustedRepairCost: number;
    adjustedCustomerLiability: number;
    resolutionNotes: string;
}
