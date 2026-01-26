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
    firstName?: string;
    lastName?: string;
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

export interface MeResponse {
    id: number;
    username: string;
    roles: Role[];
    exp: number;
}

export interface LoginResponse {
    username: string;
    tokenType: string;
}

export interface LogoutResponse {
    message: string;
}

export interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    error: Error | null;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface FieldValidationState {
    value: string;
    error?: string;
    isValid: boolean;
    touched: boolean;
}

export interface FormValidationState {
    email: FieldValidationState;
    password: FieldValidationState & {
        strength?: PasswordStrength;
    };
    confirmPassword?: FieldValidationState;
    termsAccepted?: {
        value: boolean;
        error?: string;
        isValid: boolean;
        touched: boolean;
    };
}

export interface FormMessage {
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
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

export interface PasswordChangeData {
    currentPassword: string;
    newPassword: string;
}

export interface AvatarUploadResponse {
    avatarUrl: string;
    message: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface MessageResponse {
    message: string;
}
