'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPut } from '@/lib/api/client';
import { showToast, toastMessages } from '@/lib/utils/toast';
import type { UserProfile, ProfileUpdateData } from '@/types';

export const profileKeys = {
    all: ['profile'] as const,
    me: () => [...profileKeys.all, 'me'] as const,
};

async function fetchProfile(): Promise<UserProfile> {
    return clientGet<UserProfile>('/api/users/me/profile');
}

async function updateProfileApi(data: ProfileUpdateData): Promise<UserProfile> {
    return clientPut<UserProfile>('/api/users/me/profile', data);
}

export function useProfile() {
    return useQuery({
        queryKey: profileKeys.me(),
        queryFn: fetchProfile,
        staleTime: 5 * 60 * 1000,
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
