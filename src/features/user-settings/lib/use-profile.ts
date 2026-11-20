'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPut } from '@/shared/api';
import { showToast, toastMessages } from '@/shared/lib';
import type { UserProfile, ProfileUpdateData } from '@/entities/user';
import { STALE_TIME } from '@/shared/config/constants';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const profileKeys = {
    all: ['profile'] as const,
    me: () => [...profileKeys.all, 'me'] as const,
};

async function fetchProfile(): Promise<UserProfile> {
    return clientGet<UserProfile>(ENDPOINTS.users.profile);
}

async function updateProfileApi(data: ProfileUpdateData): Promise<UserProfile> {
    return clientPut<UserProfile>(ENDPOINTS.users.profile, data);
}

export function useProfile() {
    return useQuery({
        queryKey: profileKeys.me(),
        queryFn: fetchProfile,
        staleTime: STALE_TIME.LONG,
        retry: 1,
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProfileApi,
        onSuccess: (updatedProfile) => {
            queryClient.setQueryData(profileKeys.me(), updatedProfile);
            showToast.success(toastMessages.profile?.updateSuccess ?? 'Profile updated successfully');
        },
        onError: (error: Error) => {
            showToast.error(
                toastMessages.profile?.updateError ?? 'Failed to update profile',
                error.message
            );
        },
    });
}