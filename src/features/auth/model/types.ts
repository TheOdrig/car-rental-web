import { z } from 'zod';

export const LoginSchema = z.object({
    username: z.string().min(1, { message: 'Username is required' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export const RegisterSchema = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }).optional(),
    lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }).optional(),
});

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;

import {
    Role,
    User,
    UserSummary,
    AuthResponse,
    RefreshTokenRequest,
    PasswordStrength,
    UserProfile,
    ProfileUpdateData,
    PasswordChangeData,
    AvatarUploadResponse
} from '@/shared/types';

export type {
    Role,
    User,
    UserSummary,
    AuthResponse,
    RefreshTokenRequest,
    PasswordStrength,
    UserProfile,
    ProfileUpdateData,
    PasswordChangeData,
    AvatarUploadResponse
};



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
