import { z } from 'zod';
import type { Schemas } from '@/shared/api/contract';
import { MAX_PASSWORD_BYTES, MAX_PASSWORD_LENGTH, getPasswordMaxError } from '@/shared/lib/validation';

const passwordSchema = z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(MAX_PASSWORD_LENGTH, { message: `Password must be at most ${MAX_PASSWORD_LENGTH} characters` })
    .refine((value) => getPasswordMaxError(value) === null, {
        message: `Password must be at most ${MAX_PASSWORD_BYTES} bytes; some characters take more than one`,
    });

export const LoginSchema = z.object({
    username: z.string().min(1, { message: 'Username is required' }),
    password: passwordSchema,
});

export const RegisterSchema = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
    email: z.email({ message: 'Invalid email address' }),
    password: passwordSchema,
    firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }).optional(),
    lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }).optional(),
});

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;

type FormsMatchContract = [LoginRequest, RegisterRequest] extends [Schemas['LoginRequest'], Schemas['RegisterRequest']]
    ? true
    : never;

export const authFormsMatchContract: FormsMatchContract = true;

import {
    Role,
    User,
    UserSummary,
    AuthResponse,
    RefreshTokenRequest,
    UserProfile,
    ProfileUpdateData,
    PasswordChangeData,
    AvatarUploadResponse
} from '@/entities/user';
import type { PasswordStrength } from '@/shared/types/validation';

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

export type LinkAccountResponse = Schemas['LinkAccountResponse'];

export type PasswordChangeRequest = Schemas['PasswordChangeRequest'] & { confirmPassword: string };

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

export type ForgotPasswordRequest = Schemas['ForgotPasswordRequest'];

export type ResetPasswordRequest = Schemas['ResetPasswordRequest'];

export interface MessageResponse {
    message: string;
}