export type Role = 'USER' | 'ADMIN';

export interface UserSummary {
    id: number;
    username: string;
    email: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: Role[];
    phoneNumber?: string;
    createdAt?: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    username: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface LinkAccountResponse {
    message: string;
    provider: string;
    providerEmail?: string;
    linkedAt?: string;
}

export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
