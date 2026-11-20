'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost, getApiErrorMessage } from '@/shared/api';
import { personFullName, showToast } from '@/shared/lib';
import { toAdminRentalStatus } from '@/entities/rental';
import type { PageResponse } from '@/shared/types';
import type { Schemas, WithRequired } from '@/shared/api/contract';
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
import { STALE_TIME, PAGE_SIZE } from '@/shared/config/constants';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { withQuery } from '@/shared/lib/url';

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
    const url = withQuery(ENDPOINTS.admin.users, queryString);

    return clientGet<PageResponse<User>>(url);
}

async function fetchUserStats(): Promise<UserStats> {
    return clientGet<UserStats>(ENDPOINTS.admin.userStats);
}

async function fetchUser(id: number): Promise<User> {
    return clientGet<User>(ENDPOINTS.admin.user(id));
}

async function fetchCustomerDetail(id: number): Promise<CustomerDetailResponse> {
    return clientGet<CustomerDetailResponse>(ENDPOINTS.admin.user(id));
}

type ApiRentalHistoryItem = WithRequired<
    Pick<Schemas['RentalResponse'], 'id' | 'userSummary' | 'carSummary' | 'startDate' | 'endDate' | 'days' | 'totalPrice' | 'currency' | 'status'>,
    'id' | 'startDate' | 'endDate' | 'days' | 'totalPrice'
>;

async function fetchCustomerRentalHistory(
    id: number,
    page: number,
    status?: AdminRentalStatus
): Promise<PaginatedResponse<RentalHistoryItem>> {
    const statusParam = status ? `&status=${status}` : '';
    const data = await clientGet<PaginatedResponse<ApiRentalHistoryItem>>(
        withQuery(ENDPOINTS.admin.userRentals(id), `page=${page}&size=${PAGE_SIZE.RENTAL_HISTORY}${statusParam}`)
    );

    return {
        ...data,
        content: data.content.map(rental => ({
            id: rental.id,
            customerId: rental.userSummary?.id,
            customerName: rental.userSummary?.fullName
                || rental.userSummary?.username
                || 'Unknown',
            carId: rental.carSummary?.id,
            vehicleName: `${rental.carSummary?.brand || ''} ${rental.carSummary?.model || ''}`.trim()
                || 'Unknown Vehicle',
            startDate: rental.startDate,
            endDate: rental.endDate,
            duration: rental.days,
            totalAmount: rental.totalPrice,
            currency: rental.currency,
            status: toAdminRentalStatus(rental.status),
        })),
    };
}

function displayName(result: Partial<User> | undefined, fallback?: string): string {
    return personFullName(result) || fallback || result?.email || 'The user';
}

async function banUser(params: BanUserRequest): Promise<User> {
    return clientPost<User>(ENDPOINTS.admin.userBan(params.userId), { reason: params.reason });
}

async function unbanUser(params: UnbanUserRequest): Promise<User> {
    return clientPost<User>(ENDPOINTS.admin.userUnban(params.userId), { note: params.note });
}

async function addAdminNote(params: AddNoteRequest): Promise<AdminNote> {
    return clientPost<AdminNote>(ENDPOINTS.admin.userNotes(params.userId), { text: params.text });
}

export function useUserList(filters?: UserFilters) {
    return useQuery({
        queryKey: usersKeys.list(filters),
        queryFn: () => fetchUserList(filters),
        staleTime: STALE_TIME.MEDIUM,
    });
}

export function useUserStats() {
    return useQuery({
        queryKey: usersKeys.stats(),
        queryFn: fetchUserStats,
        staleTime: STALE_TIME.MEDIUM,
    });
}

export function useUser(id: number | null | undefined) {
    return useQuery({
        queryKey: usersKeys.detail(id!),
        queryFn: () => fetchUser(id!),
        enabled: !!id,
        staleTime: STALE_TIME.LONG,
    });
}

export function useCustomerDetail(id: number) {
    return useQuery({
        queryKey: usersKeys.detail(id),
        queryFn: () => fetchCustomerDetail(id),
        staleTime: STALE_TIME.SHORT,
        enabled: !!id,
    });
}

export function useCustomerRentalHistory(id: number, page: number = 0, status?: AdminRentalStatus) {
    return useQuery({
        queryKey: usersKeys.rentalHistory(id, page, status),
        queryFn: () => fetchCustomerRentalHistory(id, page, status),
        staleTime: STALE_TIME.SHORT,
        enabled: !!id,
    });
}

export function useBanUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: banUser,
        onSuccess: (result, variables) => {
            showToast.success('User banned', `${displayName(result, variables.displayName)} has been banned.`);
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
        onSuccess: (result, variables) => {
            showToast.success('User unbanned', `${displayName(result, variables.displayName)} has been unbanned.`);
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