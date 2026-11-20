'use client';

import { useMutation } from '@tanstack/react-query';
import { clientPost, isApiError } from '@/shared/api';
import { showToast, toastMessages } from '@/shared/lib';
import type { PasswordChangeData, MessageResponse } from '@/features/auth';
import { ENDPOINTS } from '@/shared/api/endpoints';

const INVALID_PASSWORD_CODE = 'INVALID_PASSWORD';

async function changePasswordApi(data: PasswordChangeData): Promise<MessageResponse> {
    return clientPost<MessageResponse>(ENDPOINTS.users.password, data);
}

export function isWrongCurrentPassword(error: unknown): boolean {
    return isApiError(error) && error.code === INVALID_PASSWORD_CODE && /\bis incorrect\b/i.test(error.message);
}

export function useChangePassword() {
    return useMutation({
        mutationFn: changePasswordApi,
        onSuccess: () => {
            showToast.success(toastMessages.profile?.passwordChangeSuccess ?? 'Password changed successfully');
        },
        onError: (error: Error) => {
            if (isWrongCurrentPassword(error)) {
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
