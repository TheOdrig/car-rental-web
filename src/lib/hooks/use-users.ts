'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost } from '@/lib/api/client';
import { showToast } from '@/lib/utils/toast';

type UserRole = 'ADMIN' | 'CUSTOMER' | 'SUPPORT';
type UserStatus = 'ACTIVE' | 'PENDING' | 'BANNED';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    avatarUrl?: string;
    isEmailVerified: boolean;
    createdAt: string;
    lastLoginAt?: string;
}

interface UserFilters {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    size?: number;
}

interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

interface BanUserRequest {
    userId: number;
    reason: string;
}

interface UpdateRoleRequest {
    userId: number;
    role: UserRole;
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
}

export const userKeys = {
    all: ['users'] as const,
    list: (filters?: UserFilters) => [...userKeys.all, 'list', filters] as const,
    detail: (id: number) => [...userKeys.all, 'detail', id] as const,
    stats: () => [...userKeys.all, 'stats'] as const,
};

async function fetchUserList(filters?: UserFilters): Promise<PageResponse<User>> {
    const params = new URLSearchParams();

    if (filters?.role && filters.role !== 'all') {
        params.append('role', filters.role.toUpperCase());
    }
    if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status.toUpperCase());
    }
    if (filters?.search) {
        params.append('search', filters.search);
    }
    if (filters?.page !== undefined) {
        params.append('page', String(filters.page));
    }
    if (filters?.size !== undefined) {
        params.append('size', String(filters.size));
    }

    const queryString = params.toString();
    const url = queryString ? `/api/admin/users?${queryString}` : '/api/admin/users';

    return clientGet<PageResponse<User>>(url);
}

async function updateUserRole(params: UpdateRoleRequest): Promise<User> {
    return clientPost<User>(`/api/admin/users/${params.userId}/role`, { role: params.role });
}

async function banUser(params: BanUserRequest): Promise<User> {
    return clientPost<User>(`/api/admin/users/${params.userId}/ban`, { reason: params.reason });
}

async function unbanUser(userId: number): Promise<User> {
    return clientPost<User>(`/api/admin/users/${userId}/unban`, {});
}

export function useUserList(filters?: UserFilters) {
    return useQuery({
        queryKey: userKeys.list(filters),
        queryFn: () => fetchUserList(filters),
        staleTime: 2 * 60 * 1000,
    });
}

async function fetchUserStats(): Promise<UserStats> {
    return clientGet<UserStats>('/api/admin/users/stats');
}

export function useUserStats() {
    return useQuery({
        queryKey: userKeys.stats(),
        queryFn: fetchUserStats,
        staleTime: 2 * 60 * 1000,
    });
}


export function useUser(id: number | null | undefined) {
    return useQuery({
        queryKey: userKeys.detail(id!),
        queryFn: () => clientGet<User>(`/api/admin/users/${id}`),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

export function useUpdateUserRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateUserRole,
        onSuccess: (result) => {
            showToast.success('Role updated', `${result.firstName} ${result.lastName}'s role has been changed to ${result.role}.`);
            void queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
        onError: (error: Error) => {
            showToast.error('Failed to update role', error.message);
        },
    });
}

export function useBanUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: banUser,
        onSuccess: (result) => {
            showToast.success('User banned', `${result.firstName} ${result.lastName} has been banned.`);
            void queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
        onError: (error: Error) => {
            showToast.error('Failed to ban user', error.message);
        },
    });
}

export function useUnbanUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: unbanUser,
        onSuccess: (result) => {
            showToast.success('User unbanned', `${result.firstName} ${result.lastName} has been unbanned.`);
            void queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
        onError: (error: Error) => {
            showToast.error('Failed to unban user', error.message);
        },
    });
}

export function useInvalidateUsers() {
    const queryClient = useQueryClient();

    return {
        all: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
        list: () => queryClient.invalidateQueries({ queryKey: userKeys.list() }),
        single: (id: number) => queryClient.invalidateQueries({ queryKey: userKeys.detail(id) }),
    };
}
