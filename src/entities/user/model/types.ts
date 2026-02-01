export type Role = 'USER' | 'ADMIN';

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export interface UserSummary {
    id: number;
    username: string;
    email: string;
}

export interface User extends UserSummary {
    firstName?: string;
    lastName?: string;
    roles: Role[];
    phoneNumber?: string;
    createdAt?: string;
    avatarUrl?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    username: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

import type { ValidationState } from '@/shared/types/validation';

export interface ValidationDisplayProps {
    state: ValidationState;
    message?: string;
    showIcon?: boolean;
    className?: string;
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    avatarUrl: string | null;
    roles: Role[];
    enabled: boolean;
}

export interface ProfileUpdateData {
    firstName: string;
    lastName: string;
    phone?: string;
}

export interface AvatarUploadResponse {
    avatarUrl: string;
    message: string;
}

export interface PasswordChangeData {
    currentPassword: string;
    newPassword: string;
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

export type DocumentVerificationStatus = 'YES' | 'NO' | 'PENDING';

export interface CustomerVerification {
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    documentsVerified: DocumentVerificationStatus;
    documentTypes: string[];
}

export type AccountStatusType = 'ACTIVE' | 'BANNED' | 'LOCKED' | 'PENDING';

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
