import type { CurrencyType } from './common';
import type { CarStatus } from './car';
import type { Role } from './auth';
import type { DamageReport, DamageSeverity, DamageStatus } from './damage';

export type AdminRentalStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'ACTIVE'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'REJECTED';

export type PaymentStatus =
    | 'PENDING'
    | 'AUTHORIZED'
    | 'CAPTURED'
    | 'FAILED'
    | 'REFUNDED';

export type DocumentVerificationStatus = 'YES' | 'NO' | 'PENDING';

export type AccountStatusType = 'ACTIVE' | 'PENDING' | 'BANNED';

export type TimelineEventType =
    | 'created'
    | 'approved'
    | 'picked_up'
    | 'returned'
    | 'cancelled'
    | 'rejected';

export interface TimelineEvent {
    type: TimelineEventType;
    timestamp: string;
    adminName?: string;
    notes?: string;
}

export interface RentalHistoryItem {
    id: number;
    customerId: number;
    customerName: string;
    carId: number;
    vehicleName: string;
    startDate: string;
    endDate: string;
    duration: number;
    totalAmount: number;
    status: AdminRentalStatus;
}

export interface AdminNote {
    id: number;
    adminId: number;
    adminName: string;
    timestamp: string;
    text: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface RentalPricing {
    dailyRate: number;
    totalDays: number;
    subtotal: number;
    discounts: number;
    finalTotal: number;
    currency: CurrencyType;
    exchangeRate?: number;
}

export interface RentalCustomerInfo {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    stats: {
        totalRentals: number;
        totalSpent: number;
        damageCount: number;
    };
}

export interface RentalVehicleInfo {
    id: number;
    brand: string;
    model: string;
    licensePlate: string;
    imageUrl?: string;
    status: CarStatus;
    fuelType: string;
    transmissionType: string;
}

export interface RentalPaymentInfo {
    totalAmount: number;
    status: PaymentStatus;
    method: string;
    last4?: string;
    paymentIntentId?: string;
}

export interface RentalNotes {
    approval?: string;
    pickup?: string;
    return?: string;
    cancellation?: string;
}

export interface RentalDetailResponse {
    id: number;
    status: AdminRentalStatus;
    startDate: string;
    endDate: string;
    duration: number;
    pricing: RentalPricing;
    customer: RentalCustomerInfo;
    vehicle: RentalVehicleInfo;
    payment: RentalPaymentInfo;
    timeline: TimelineEvent[];
    damages: DamageReport[];
    notes: RentalNotes;
}

export interface VehiclePricing {
    dailyRate: number;
    weeklyRate: number;
    depositAmount: number;
    currency: CurrencyType;
}

export interface VehicleImages {
    primary: string;
    additional: string[];
}

export interface VehicleStatistics {
    totalRentals: number;
    totalRevenue: number;
    averageRentalDuration: number;
    totalDamageReports: number;
    totalDamageCost: number;
    occupancyRate: number;
    averageRating?: number;
}

export interface VehicleCurrentStatus {
    status: CarStatus;
    description: string;
    lastChangedAt: string;
    lastChangedBy?: string;
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
    year: number;
    licensePlate: string;
    vin?: string;
    status: CarStatus;
    fuelType: string;
    transmissionType: string;
    bodyType: string;
    seats: number;
    color: string;
    pricing?: VehiclePricing;
    images?: VehicleImages;
    statistics?: VehicleStatistics;
    currentStatus?: VehicleCurrentStatus;
    activeRental?: VehicleActiveRental;
    rentalHistory?: RentalHistoryItem[];
    rentalHistoryTotal?: number;
}

export interface CustomerVerification {
    emailVerified: boolean;
    phoneVerified: boolean;
    documentsVerified: DocumentVerificationStatus;
    documentTypes: string[];
}

export interface CustomerStatistics {
    totalRentals: number;
    completedRentals: number;
    cancelledRentals: number;
    activeRentals: number;
    totalSpent: number;
    averageRentalDuration: number;
    totalDamageReports: number;
    totalDamageCost: number;
    lateReturns: number;
    customerSinceDays: number;
}

export interface CustomerAccountStatus {
    status: AccountStatusType;
    bannedAt?: string;
    banReason?: string;
    bannedBy?: number;
    lastStatusChange: string;
}

export interface CustomerDetailResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    roles: Role[];
    registrationDate: string;
    lastLoginDate?: string;
    verification: CustomerVerification;
    statistics: CustomerStatistics;
    accountStatus: CustomerAccountStatus;
    rentalHistory: RentalHistoryItem[];
    rentalHistoryTotal: number;
    adminNotes: AdminNote[];
}

export interface BanCustomerRequest {
    reason: string;
}

export interface UnbanCustomerRequest {
    note?: string;
}

export interface AddAdminNoteRequest {
    text: string;
}

export interface ChangeVehicleStatusRequest {
    status: CarStatus;
    reason?: string;
}

export interface DamageSummary {
    id: number;
    description: string;
    severity: DamageSeverity;
    status: DamageStatus;
    reportedAt: string;
    estimatedCost?: number;
}
