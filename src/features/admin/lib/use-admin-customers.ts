'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost } from '@/shared/api';
import { showToast } from '@/shared/lib';
import type {
    CustomerDetailResponse,
    PaginatedResponse,
    RentalHistoryItem,
    AdminNote,
    AdminRentalStatus,
} from '@/features/admin';
import { adminKeys } from './admin-keys';

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
    const data = await clientGet<PaginatedResponse<ApiRentalHistoryItem>>(`/api/admin/users/${id}/rentals?page=${page}&size=10${statusParam}`);
    return {
        ...data,
        content: data.content.map(rental => ({
            id: rental.id,
            customerId: rental.userSummary?.id,
            customerName: `${rental.userSummary?.firstName || ''} ${rental.userSummary?.lastName || ''}`.trim() || rental.userSummary?.username || 'Unknown',
            carId: rental.carSummary?.id,
            vehicleName: `${rental.carSummary?.brand || ''} ${rental.carSummary?.model || ''}`.trim() || 'Unknown Vehicle',
            startDate: rental.startDate,
            endDate: rental.endDate,
            duration: rental.days,
            totalAmount: rental.totalPrice,
            status: rental.status as AdminRentalStatus,
        })),
    };
}

async function banCustomer({ userId, reason }: { userId: number; reason: string }): Promise<void> {
    return clientPost<void>(`/api/admin/users/${userId}/ban`, { reason });
}

async function unbanCustomer({ userId, note }: { userId: number; note?: string }): Promise<void> {
    return clientPost<void>(`/api/admin/users/${userId}/unban`, { note });
}

async function addAdminNote({ userId, text }: { userId: number; text: string }): Promise<AdminNote> {
    return clientPost<AdminNote>(`/api/admin/users/${userId}/notes`, { text });
}

export function useCustomerDetail(id: number) {
    return useQuery({
        queryKey: adminKeys.customerDetail(id),
        queryFn: () => fetchCustomerDetail(id),
        staleTime: 30 * 1000,
        enabled: !!id,
    });
}

export function useCustomerRentalHistory(id: number, page: number = 0, status?: AdminRentalStatus) {
    return useQuery({
        queryKey: adminKeys.customerRentalHistory(id, page, status),
        queryFn: () => fetchCustomerRentalHistory(id, page, status),
        staleTime: 30 * 1000,
        enabled: !!id,
    });
}

export function useBanCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: banCustomer,
        onSuccess: (_, variables) => {
            showToast.success('Customer banned', 'The customer has been banned successfully.');
            void queryClient.invalidateQueries({ queryKey: adminKeys.customerDetail(variables.userId) });
            void queryClient.invalidateQueries({ queryKey: adminKeys.users() });
        },
        onError: (error: Error) => {
            showToast.error('Failed to ban customer', error.message);
        },
    });
}

export function useUnbanCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: unbanCustomer,
        onSuccess: (_, variables) => {
            showToast.success('Customer unbanned', 'The customer has been unbanned successfully.');
            void queryClient.invalidateQueries({ queryKey: adminKeys.customerDetail(variables.userId) });
            void queryClient.invalidateQueries({ queryKey: adminKeys.users() });
        },
        onError: (error: Error) => {
            showToast.error('Failed to unban customer', error.message);
        },
    });
}

export function useAddAdminNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addAdminNote,
        onSuccess: (_, variables) => {
            showToast.success('Note added', 'Admin note has been added successfully.');
            void queryClient.invalidateQueries({ queryKey: adminKeys.customerDetail(variables.userId) });
            void queryClient.invalidateQueries({ queryKey: adminKeys.customerNotes(variables.userId) });
        },
        onError: (error: Error) => {
            showToast.error('Failed to add note', error.message);
        },
    });
}
