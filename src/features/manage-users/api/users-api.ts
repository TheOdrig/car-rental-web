'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost, getApiErrorMessage } from '@/shared/api';
import { showToast } from '@/shared/lib';
import { toAdminRentalStatus } from '@/entities/rental';
import type { PageResponse } from '@/shared/types';
import { usersKeys } from './users-keys';
import type { UserFilters } from './users-keys';
import type {
    User,
    UserStats,
    BanUserRequest,
    UnbanUserRequest,
    AddNoteRequest,
    CustomerDetailResponse,
    PaginatedResponse,
    RentalHistoryItem,
    AdminNote,
    AdminRentalStatus,
} from '../model/types';





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

async function fetchUserStats(): Promise<UserStats> {
    return clientGet<UserStats>('/api/admin/users/stats');
}

async function fetchUser(id: number): Promise<User> {
    return clientGet<User>(`/api/admin/users/${id}`);
}

async function fetchCustomerDetail(id: number): Promise<CustomerDetailResponse> {
    return clientGet<CustomerDetailResponse>(`/api/admin/users/${id}`);
}

interface ApiRentalHistoryItem {
    id: number;
    userSummary?: {
        id: number;
        firstName?: string;
        lastName?: string;
        username: string;
    };
    carSummary?: {
        id: number;
        brand: string;
        model: string;
    };
    startDate: string;
    endDate: string;
    days: number;
    totalPrice: number;
    status: string;
}

async function fetchCustomerRentalHistory(
    id: number,
    page: number,
    status?: AdminRentalStatus
): Promise<PaginatedResponse<RentalHistoryItem>> {
    const statusParam = status ? `&status=${status}` : '';
    const data = await clientGet<PaginatedResponse<ApiRentalHistoryItem>>(
        `/api/admin/users/${id}/rentals?page=${page}&size=10${statusParam}`
    );

    return {
        ...data,
        content: data.content.map(rental => ({
            id: rental.id,
            customerId: rental.userSummary?.id,
            customerName: `${rental.userSummary?.firstName || ''} ${rental.userSummary?.lastName || ''}`.trim()
                || rental.userSummary?.username
                || 'Unknown',
            carId: rental.carSummary?.id,
            vehicleName: `${rental.carSummary?.brand || ''} ${rental.carSummary?.model || ''}`.trim()
                || 'Unknown Vehicle',
            startDate: rental.startDate,
            endDate: rental.endDate,
            duration: rental.days,
            totalAmount: rental.totalPrice,
            status: toAdminRentalStatus(rental.status),
        })),
    };
}

async function banUser(params: BanUserRequest): Promise<User> {
    return clientPost<User>(`/api/admin/users/${params.userId}/ban`, { reason: params.reason });
}

async function unbanUser(params: UnbanUserRequest): Promise<User> {
    return clientPost<User>(`/api/admin/users/${params.userId}/unban`, { note: params.note });
}

async function addAdminNote(params: AddNoteRequest): Promise<AdminNote> {
    return clientPost<AdminNote>(`/api/admin/users/${params.userId}/notes`, { text: params.text });
}





export function useUserList(filters?: UserFilters) {
    return useQuery({
        queryKey: usersKeys.list(filters),
        queryFn: () => fetchUserList(filters),
        staleTime: 2 * 60 * 1000,
    });
}

export function useUserStats() {
    return useQuery({
        queryKey: usersKeys.stats(),
        queryFn: fetchUserStats,
        staleTime: 2 * 60 * 1000,
    });
}

export function useUser(id: number | null | undefined) {
    return useQuery({
        queryKey: usersKeys.detail(id!),
        queryFn: () => fetchUser(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

export function useCustomerDetail(id: number) {
    return useQuery({
        queryKey: usersKeys.detail(id),
        queryFn: () => fetchCustomerDetail(id),
        staleTime: 30 * 1000,
        enabled: !!id,
    });
}

export function useCustomerRentalHistory(id: number, page: number = 0, status?: AdminRentalStatus) {
    return useQuery({
        queryKey: usersKeys.rentalHistory(id, page, status),
        queryFn: () => fetchCustomerRentalHistory(id, page, status),
        staleTime: 30 * 1000,
        enabled: !!id,
    });
}

export function useBanUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: banUser,
        onSuccess: (result) => {
            showToast.success('User banned', `${result.firstName} ${result.lastName} has been banned.`);
            void queryClient.invalidateQueries({ queryKey: usersKeys.all });
        },
        onError: (error: Error) => {
            showToast.error('Failed to ban user', getApiErrorMessage(error));
        },
    });
}

export function useUnbanUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: unbanUser,
        onSuccess: (result) => {
            showToast.success('User unbanned', `${result.firstName} ${result.lastName} has been unbanned.`);
            void queryClient.invalidateQueries({ queryKey: usersKeys.all });
        },
        onError: (error: Error) => {
            showToast.error('Failed to unban user', getApiErrorMessage(error));
        },
    });
}

export function useAddAdminNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addAdminNote,
        onSuccess: (result, variables) => {
            showToast.success('Note added', 'Admin note has been added successfully.');
            void queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) });
            void queryClient.invalidateQueries({ queryKey: usersKeys.notes(variables.userId) });
        },
        onError: (error: Error) => {
            showToast.error('Failed to add note', error.message);
        },
    });
}

export function useInvalidateUsers() {
    const queryClient = useQueryClient();

    return {
        all: () => queryClient.invalidateQueries({ queryKey: usersKeys.all }),
        list: () => queryClient.invalidateQueries({ queryKey: usersKeys.list() }),
        single: (id: number) => queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) }),
    };
}