'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showToast, toastMessages } from '@/lib/utils/toast';
import { profileKeys } from './use-profile';
import type { AvatarUploadResponse } from '@/types';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface AvatarValidationError {
    type: 'invalid_type' | 'file_too_large';
    message: string;
}

export function validateAvatarFile(file: File): AvatarValidationError | null {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return {
            type: 'invalid_type',
            message: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)',
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            type: 'file_too_large',
            message: 'File size must be less than 5MB',
        };
    }

    return null;
}

async function uploadAvatarApi(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch('/api/users/me/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to upload avatar' }));
        throw new Error(error.message || 'Failed to upload avatar');
    }

    return response.json();
}

async function deleteAvatarApi(): Promise<AvatarUploadResponse> {
    const response = await fetch('/api/users/me/avatar', {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to delete avatar' }));
        throw new Error(error.message || 'Failed to delete avatar');
    }

    return response.json();
}

export function useUploadAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file: File) => {
            const validationError = validateAvatarFile(file);
            if (validationError) {
                throw new Error(validationError.message);
            }
            return uploadAvatarApi(file);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: profileKeys.me() });
            showToast.success(toastMessages.profile?.avatarUploadSuccess ?? 'Avatar uploaded successfully');
        },
        onError: (error: Error) => {
            showToast.error(
                toastMessages.profile?.avatarUploadError ?? 'Failed to upload avatar',
                error.message
            );
        },
    });
}

export function useDeleteAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAvatarApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: profileKeys.me() });
            showToast.success(toastMessages.profile?.avatarDeleteSuccess ?? 'Avatar deleted successfully');
        },
        onError: (error: Error) => {
            showToast.error(
                toastMessages.profile?.avatarDeleteError ?? 'Failed to delete avatar',
                error.message
            );
        },
    });
}
