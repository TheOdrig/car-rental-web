



export type UserRole = 'ADMIN' | 'CUSTOMER' | 'SUPPORT';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'BANNED';
export type AccountStatusType = 'ACTIVE' | 'BANNED' | 'LOCKED' | 'PENDING';
export type DocumentVerificationStatus = 'YES' | 'NO' | 'PENDING';
export type Role = 'USER' | 'ADMIN';
export type AdminRentalStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'OVERDUE';





export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    avatarUrl?: string;
    isEmailVerified: boolean;
    createdAt: string;
    lastLoginAt?: string;
}





export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
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

export interface AdminNote {
    id: number;
    content: string;
    adminName: string;
    createdAt: string;
    isImportant: boolean;
}

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





export interface BanUserRequest {
    userId: number;
    reason: string;
}

export interface UnbanUserRequest {
    userId: number;
    note?: string;
}

export interface AddNoteRequest {
    userId: number;
    text: string;
}