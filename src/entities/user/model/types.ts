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

