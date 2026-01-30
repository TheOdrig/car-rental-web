import type { CurrencyType } from './common';

export type Role = 'USER' | 'ADMIN';

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

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export type CarStatus =
    | 'Available'
    | 'Rented'
    | 'Sold'
    | 'Maintenance'
    | 'Reserved'
    | 'Damaged'
    | 'Inspection';

export interface CarSummary {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    productionYear: number;
    formattedPrice: string;
    currencyType: CurrencyType;
    carStatusType: CarStatus;
    color?: string;
    kilometer?: number;
    thumbnailUrl?: string;
    isFeatured?: boolean;
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
