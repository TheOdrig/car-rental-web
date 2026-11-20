'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientDelete, clientPost, getSafeErrorMessage } from '@/shared/api';
import { showToast, toastMessages } from '@/shared/lib';
import { profileKeys } from './use-profile';
import type { AvatarUploadResponse } from '@/entities/user';
import { MAX_IMAGE_UPLOAD_BYTES, MAX_IMAGE_UPLOAD_MB } from '@/shared/config/constants';
import { ENDPOINTS } from '@/shared/api/endpoints';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

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

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
        return {
            type: 'file_too_large',
            message: `File size must be less than ${MAX_IMAGE_UPLOAD_MB}MB`,
        };
    }

    return null;
}

async function uploadAvatarApi(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    return clientPost<AvatarUploadResponse>(ENDPOINTS.users.avatar, formData);
}

async function deleteAvatarApi(): Promise<AvatarUploadResponse> {
    return clientDelete<AvatarUploadResponse>(ENDPOINTS.users.avatar);
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
                getSafeErrorMessage(error, 'The picture could not be stored. Please try again later.')
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