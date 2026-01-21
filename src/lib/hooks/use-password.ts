'use client';

import { useMutation } from '@tanstack/react-query';
import { clientPost } from '@/lib/api/client';
import { showToast, toastMessages } from '@/lib/utils/toast';
import type { PasswordChangeData, MessageResponse } from '@/types';

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
