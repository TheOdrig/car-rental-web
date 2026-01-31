'use client';

import { useQuery } from '@tanstack/react-query';
import { clientGet } from '@/shared/api';
import type { User, Role } from '../model/types';

interface MeResponse {
    id: number;
    username: string;
    roles: Role[];
}

export const userKeys = {
    all: ['user'] as const,
    me: () => [...userKeys.all, 'me'] as const,
};

async function fetchMe(): Promise<MeResponse> {
    return clientGet<MeResponse>('/api/auth/me');
}

export function useCurrentUser() {
    const {
        data: meData,
        isLoading,
        error,
    } = useQuery({
        queryKey: userKeys.me(),
        queryFn: fetchMe,
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });

    const user: User | null = meData
        ? {
            id: meData.id,
            username: meData.username,
            email: '',
            roles: meData.roles,
        }
        : null;

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.roles?.includes('ADMIN') ?? false,
        error: error as Error | null,
    };
}
