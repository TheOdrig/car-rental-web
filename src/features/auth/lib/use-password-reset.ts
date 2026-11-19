'use client';

import { useMutation } from '@tanstack/react-query';
import { clientPost, isRateLimited } from '@/shared/api';
import { showToast, describeResetLinkError } from '@/shared/lib';
import type { ForgotPasswordRequest, ResetPasswordRequest, MessageResponse } from '@/features/auth';

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
            if (isRateLimited(error)) {
                return;
            }

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
            if (isRateLimited(error)) {
                return;
            }

            const described = describeResetLinkError(error.message);

            if (described) {
                showToast.error(described.title, described.detail);
            } else {
                showToast.error('Failed to reset password', error.message);
            }
        },
    });
}