import type { DamageReport } from '@/entities/damage';

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

export interface CustomerStatistics {
    totalRentals: number;
    activeRentals: number;
    completedRentals: number;
    cancelledRentals: number;
    lateReturns: number;
    totalDamageReports: number;
    totalDamageCost: number;
    totalSpent: number;
    averageRentalDuration: number;
    customerSinceDays: number;
}

export interface CustomerVerification {
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    documentsVerified: DocumentVerificationStatus;
    documentTypes: string[];
}

export type DocumentVerificationStatus = 'YES' | 'NO' | 'PENDING';

export interface CustomerAccountStatus {
    status: AccountStatusType;
    isEnabled: boolean;
    isLocked: boolean;
    isExpired: boolean;
    isCredentialsExpired: boolean;
    banReason?: string;
    bannedAt?: string;
    lastStatusChange: string;
}

export type AccountStatusType = 'ACTIVE' | 'BANNED' | 'LOCKED' | 'PENDING';

export interface AdminNote {
    id: number;
    content: string;
    adminName: string;
    createdAt: string;
    isImportant: boolean;
}

export type Role = 'USER' | 'ADMIN';

export interface CustomerDetailResponse {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    avatarUrl: string | null;
    roles: Role[];
    createdAt: string;
    registrationDate: string;
    lastLoginDate?: string;
    statistics: CustomerStatistics;
    verification: CustomerVerification;
    accountStatus: CustomerAccountStatus;
    adminNotes: AdminNote[];
}

export interface VehicleStatistics {
    totalRentals: number;
    totalRevenue: number;
    totalDaysRented: number;
    occupancyRate: number;
    averageRentalDuration: number;
    lastRentalDate?: string;
    totalDamageReports: number;
    totalDamageCost: number;
    averageRating?: number;
}

export interface VehicleImages {
    primary: string;
    additional: string[];
}

export interface VehicleCurrentStatus {
    status: string;
    statusColor: string;
    isAvailable: boolean;
    description?: string;
    lastChangedAt: string;
    lastChangedBy?: string;
    nextAvailableDate?: string;
    activeRentalId?: number;
}

export interface VehicleActiveRental {
    id: number;
    customerId: number;
    customerName: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
}

export interface VehicleDetailResponse {
    id: number;
    brand: string;
    model: string;
    licensePlate: string;
    year: number;
    color: string;
    fuelType: string;
    transmissionType: string;
    bodyType: string;
    seats: number;
    vin?: string;
    images: VehicleImages;
    pricing: {
        dailyRate: number;
        weeklyRate: number;
        depositAmount: number;
        currency: string;
    };
    statistics?: VehicleStatistics;
    currentStatus?: VehicleCurrentStatus;
    activeRental?: VehicleActiveRental;
    status?: string;
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

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}
import type { LateReturnStatus } from '@/entities/rental';

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
    damages: DamageReport[];
    notes: {
        approval?: string;
        pickup?: string;
        return?: string;
        cancellation?: string;
    };
    penaltyAmount?: number;
    lateReturnStatus?: LateReturnStatus;
}
