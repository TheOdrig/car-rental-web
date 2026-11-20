'use client';

import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { clientPost, clientGet, isApiError, onSessionExpired } from '@/shared/api';
import { classifyRoute } from '@/shared/config/route-access';
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
import { STALE_TIME } from '@/shared/config/constants';
import { ROUTES } from '@/shared/config/routes';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { hasAdminRole } from '@/entities/user';

export const authKeys = {
    all: ['auth'] as const,
    me: () => [...authKeys.all, 'me'] as const,
};

async function fetchMe(): Promise<MeResponse | null> {
    try {
        return await clientGet<MeResponse | null>(ENDPOINTS.auth.meOptional);
    } catch (error) {
        if (isApiError(error) && error.status === 401) {
            return null;
        }
        throw error;
    }
}

const SESSION_CHECK_INTERVAL_MS = 10 * 60 * 1000;

let loggingOut = false;

function handleSessionExpired(queryClient: QueryClient): void {
    forgetPrincipal(queryClient);

    if (loggingOut) {
        return;
    }

    if (typeof window === 'undefined') {
        return;
    }

    const { pathname, search } = window.location;
    const access = classifyRoute(pathname);
    if (access === 'protected' || access === 'admin') {
        const login = new URL(ROUTES.login, window.location.origin);
        login.searchParams.set('callbackUrl', `${pathname}${search}`);
        window.location.assign(login.href);
    }
}

export function useSessionKeeper(): void {
    const queryClient = useQueryClient();

    useQuery({
        queryKey: authKeys.me(),
        queryFn: fetchMe,
        retry: 1,
        staleTime: STALE_TIME.LONG,
        refetchOnWindowFocus: (query) => Boolean(query.state.data),
        refetchInterval: (query) => (query.state.data ? SESSION_CHECK_INTERVAL_MS : false),
        refetchIntervalInBackground: false,
    });

    useEffect(() => {
        onSessionExpired(() => handleSessionExpired(queryClient));
        return () => onSessionExpired(null);
    }, [queryClient]);
}

function forgetPrincipal(queryClient: QueryClient): void {
    queryClient.clear();
    queryClient.setQueryData(authKeys.me(), null);
}

async function adoptPrincipal(queryClient: QueryClient): Promise<MeResponse | null> {
    loggingOut = false;
    queryClient.clear();
    return queryClient.fetchQuery({ queryKey: authKeys.me(), queryFn: fetchMe, staleTime: STALE_TIME.NONE }).catch(() => null);
}

async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
    return clientPost<LoginResponse>(ENDPOINTS.auth.login, credentials);
}

async function logoutApi(): Promise<LogoutResponse> {
    return clientPost<LogoutResponse>(ENDPOINTS.auth.logout);
}

async function refreshApi(): Promise<LoginResponse> {
    return clientPost<LoginResponse>(ENDPOINTS.auth.refresh);
}

async function registerApi(data: RegisterRequest): Promise<LoginResponse> {
    return clientPost<LoginResponse>(ENDPOINTS.auth.register, data);
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
        staleTime: STALE_TIME.LONG,
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
    const isAdmin = hasAdminRole(user?.roles);

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
        onMutate: () => {
            loggingOut = true;
        },
        onError: () => {
            loggingOut = false;
        },
        onSuccess: () => {
            showToast.success(toastMessages.auth.logoutSuccess);
            router.push(ROUTES.home);
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
        staleTime: STALE_TIME.LONG,
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
        isAdmin: hasAdminRole(user?.roles),
        error: error as Error | null,
    };
}

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credentials: LoginRequest) => {
            const response = await loginApi(credentials);
            const principal = await adoptPrincipal(queryClient);
            return { ...response, principal };
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: logoutApi,
        onMutate: () => {
            loggingOut = true;
        },
        onError: () => {
            loggingOut = false;
        },
        onSuccess: () => {
            router.push(ROUTES.home);
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
            router.push(ROUTES.login);
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