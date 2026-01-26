'use client';

import { useMutation } from '@tanstack/react-query';
import { clientPost } from '@/lib/api/client';
import { showToast } from '@/lib/utils/toast';
import type { ForgotPasswordRequest, ResetPasswordRequest, MessageResponse } from '@/types';

async function forgotPasswordApi(data: ForgotPasswordRequest): Promise<MessageResponse> {
    return clientPost<MessageResponse>('/api/auth/forgot-password', data);
}

async function resetPasswordApi(data: ResetPasswordRequest): Promise<MessageResponse> {
    return clientPost<MessageResponse>('/api/auth/reset-password', data);
}

export function useForgotPassword() {
    return useMutation({
        mutationFn: forgotPasswordApi,
        onSuccess: () => {
            showToast.success('Password reset email sent. Please check your inbox.');
        },
        onError: (error: Error) => {
            const message = error.message.toLowerCase();

            if (message.includes('not found') || message.includes('no user')) {
                showToast.error('Email not found', 'No account found with this email address');
            } else {
                showToast.error('Failed to send reset email', error.message);
            }
        },
    });
}

export function useResetPassword() {
    return useMutation({
        mutationFn: resetPasswordApi,
        onSuccess: () => {
            showToast.success('Password reset successfully. You can now log in with your new password.');
        },
        onError: (error: Error) => {
            const message = error.message.toLowerCase();

            if (message.includes('expired')) {
                showToast.error('Token expired', 'This password reset link has expired. Please request a new one.');
            } else if (message.includes('invalid') || message.includes('used')) {
                showToast.error('Invalid token', 'This password reset link is invalid or has already been used.');
            } else {
                showToast.error('Failed to reset password', error.message);
            }
        },
    });
}

