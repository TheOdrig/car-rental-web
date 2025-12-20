'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { clientPost, clientGet } from '@/lib/api/client';
import type {
    User,
    LoginRequest,
    MeResponse,
    LoginResponse,
    LogoutResponse,
    AuthContextValue,
} from '@/types';


export const authKeys = {
    all: ['auth'] as const,
    me: () => [...authKeys.all, 'me'] as const,
};

async function fetchMe(): Promise<MeResponse> {
    return clientGet<MeResponse>('/api/auth/me');
}

async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
    return clientPost<LoginResponse>('/api/auth/login', credentials);
}

async function logoutApi(): Promise<LogoutResponse> {
    return clientPost<LogoutResponse>('/api/auth/logout');
}

async function refreshApi(): Promise<LoginResponse> {
    return clientPost<LoginResponse>('/api/auth/refresh');
}

export function useAuth(): AuthContextValue {
    const queryClient = useQueryClient();
    const router = useRouter();

    const {
        data: meData,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: authKeys.me(),
        queryFn: fetchMe,
        retry: false,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });

    const user: User | null = meData
        ? {
            id: meData.id,
            username: meData.username,
            email: '',
            roles: meData.roles,
        }
        : null;

    const isAuthenticated = !!user;
    const isAdmin = user?.roles?.includes('ADMIN') ?? false;

    const loginMutation = useMutation({
        mutationFn: loginApi,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: authKeys.me() });
        },
        onError: (error) => {
            console.error('Login failed:', error);
        },
    });

    const logoutMutation = useMutation({
        mutationFn: logoutApi,
        onSuccess: () => {
            queryClient.setQueryData(authKeys.me(), null);
            queryClient.removeQueries({ queryKey: authKeys.all });
            router.push('/');
        },
        onError: (error) => {
            console.error('Logout failed:', error);
            queryClient.setQueryData(authKeys.me(), null);
        },
    });


    const login = useCallback(
        async (credentials: LoginRequest) => {
            await loginMutation.mutateAsync(credentials);
        },
        [loginMutation]
    );

    const logout = useCallback(async () => {
        await logoutMutation.mutateAsync();
    }, [logoutMutation]);

    const refresh = useCallback(async () => {
        await refetch();
    }, [refetch]);

    return {
        user,
        isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
        isAuthenticated,
        isAdmin,
        error: error as Error | null,
        login,
        logout,
        refresh,
    };
}


export function useCurrentUser() {
    const {
        data: meData,
        isLoading,
        error,
    } = useQuery({
        queryKey: authKeys.me(),
        queryFn: fetchMe,
        retry: false,
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


export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: loginApi,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: authKeys.me() });
        },
    });
}


export function useLogout() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: logoutApi,
        onSuccess: () => {
            queryClient.setQueryData(authKeys.me(), null);
            queryClient.removeQueries({ queryKey: authKeys.all });
            router.push('/');
        },
    });
}


export function useRefreshToken() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: refreshApi,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: authKeys.me() });
        },
        onError: () => {
            queryClient.setQueryData(authKeys.me(), null);
            queryClient.removeQueries({ queryKey: authKeys.all });
            router.push('/login');
        },
    });
}
