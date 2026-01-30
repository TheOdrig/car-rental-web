'use client';

import { useMutation } from '@tanstack/react-query';
import { clientPost } from '@/shared/api';
import { showToast, toastMessages } from '@/shared/lib';
import type { PasswordChangeData, MessageResponse } from '@/features/auth';

async function changePasswordApi(data: PasswordChangeData): Promise<MessageResponse> {
    return clientPost<MessageResponse>('/api/users/me/password', data);
}

export function useChangePassword() {
    return useMutation({
        mutationFn: changePasswordApi,
        onSuccess: () => {
            showToast.success(toastMessages.profile?.passwordChangeSuccess ?? 'Password changed successfully');
        },
        onError: (error: Error) => {
            const message = error.message.toLowerCase();

            if (message.includes('current password') || message.includes('incorrect')) {
                showToast.error('Incorrect current password', 'Please check your current password and try again');
            } else {
                showToast.error(
                    toastMessages.profile?.passwordChangeError ?? 'Failed to change password',
                    error.message
                );
            }
        },
    });
}
