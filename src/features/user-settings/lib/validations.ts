import { z } from 'zod';
import { MAX_PASSWORD_BYTES, MAX_PASSWORD_LENGTH, getPasswordMaxError } from '@/shared/lib/validation';

function maxPassword(schema: z.ZodString) {
    return schema
        .max(MAX_PASSWORD_LENGTH, `Password must be at most ${MAX_PASSWORD_LENGTH} characters`)
        .refine(
            (val) => getPasswordMaxError(val) === null,
            `Password must be at most ${MAX_PASSWORD_BYTES} bytes; some characters take more than one`
        );
}

export const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

export function normalizePhone(value: string | null | undefined): string {
    return (value ?? '').replace(/[\s\-().]/g, '');
}

export const profileSchema = z.object({
    firstName: z.string().trim().max(50, 'First name must be at most 50 characters'),
    lastName: z.string().trim().max(50, 'Last name must be at most 50 characters'),
    phone: z
        .string()
        .refine(
            (val) => !val || PHONE_REGEX.test(normalizePhone(val)),
            'Invalid phone number format (7 to 15 digits, optional leading +, e.g. +1234567890)'
        )
        .optional()
        .or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export function toProfileUpdate(data: ProfileFormData): { firstName?: string; lastName?: string; phone?: string } {
    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();
    const phone = normalizePhone(data.phone);
    return {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(phone ? { phone } : {}),
    };
}

export const passwordChangeSchema = z
    .object({
        currentPassword: maxPassword(z.string().min(1, 'Current password is required')),
        newPassword: maxPassword(z.string().min(8, 'Password must be at least 8 characters')),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

export const forgotPasswordSchema = z.object({
    email: z.email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
    .object({
        newPassword: maxPassword(z.string().min(8, 'Password must be at least 8 characters')),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function getProfileDefaultValues(profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
}): ProfileFormData {
    return {
        firstName: profile?.firstName ?? '',
        lastName: profile?.lastName ?? '',
        phone: profile?.phone ?? '',
    };
}

export function getPasswordChangeDefaultValues(): PasswordChangeFormData {
    return {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    };
}

export function getForgotPasswordDefaultValues(): ForgotPasswordFormData {
    return {
        email: '',
    };
}

export function getResetPasswordDefaultValues(): ResetPasswordFormData {
    return {
        newPassword: '',
        confirmPassword: '',
    };
}