'use client';

import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { clientPost, clientGet } from '@/shared/api';
import { showToast, toastMessages } from '@/shared/lib';
import type {
    User,
    LoginRequest,
    RegisterRequest,
    MeResponse,
    LoginResponse,
    LogoutResponse,
    AuthContextValue,
} from '../model/types';

export const authKeys = {
    all: ['auth'] as const,
    me: () => [...authKeys.all, 'me'] as const,
};

async function fetchMe(): Promise<MeResponse> {
    return clientGet<MeResponse>('/api/auth/me');
}

function forgetPrincipal(queryClient: QueryClient): void {
    queryClient.clear();
    queryClient.setQueryData(authKeys.me(), null);
}

async function adoptPrincipal(queryClient: QueryClient): Promise<void> {
    queryClient.clear();
    await queryClient.fetchQuery({ queryKey: authKeys.me(), queryFn: fetchMe, staleTime: 0 }).catch(() => undefined);
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

async function registerApi(data: RegisterRequest): Promise<LoginResponse> {
    return clientPost<LoginResponse>('/api/auth/register', data);
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
        retry: 1,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,

        refetchInterval: 10 * 60 * 1000,
        refetchIntervalInBackground: false,
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
            showToast.success(toastMessages.auth.loginSuccess);
            await adoptPrincipal(queryClient);
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.auth.loginError, error.message);
        },
    });

    const logoutMutation = useMutation({
        mutationFn: logoutApi,
        onSuccess: () => {
            showToast.success(toastMessages.auth.logoutSuccess);
            router.push('/');
        },
        onSettled: () => {
            forgetPrincipal(queryClient);
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

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: loginApi,
        onSuccess: async () => {
            await adoptPrincipal(queryClient);
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: logoutApi,
        onSuccess: () => {
            router.push('/');
        },
        onSettled: () => {
            forgetPrincipal(queryClient);
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
            forgetPrincipal(queryClient);
            router.push('/login');
        },
    });
}

export function useRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: registerApi,
        onSuccess: async () => {
            await adoptPrincipal(queryClient);
        },
    });
}