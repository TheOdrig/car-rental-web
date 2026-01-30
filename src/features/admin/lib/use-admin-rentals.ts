'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost } from '@/shared/api';
import { showToast, toastMessages } from '@/shared/lib';
import type {
    QuickActionResult,
    ProcessReturnData,
    RentalDetailResponse,
    AdminRentalStatus,
} from '@/features/admin';
import type { CarStatus } from '@/entities/car';
import { adminKeys } from './admin-keys';

async function approveRental({ rentalId, notes }: { rentalId: number; notes?: string }): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/approve`, { notes });
}

async function processPickup({ rentalId, notes }: { rentalId: number; notes?: string }): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/pickup`, { notes });
}

async function processReturn({ rentalId, data }: { rentalId: number; data?: string | ProcessReturnData }): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/return`, data);
}

async function rejectRental({ rentalId, reason }: { rentalId: number; reason: string }): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/reject`, { reason });
}

async function fetchRentalDetail(id: number): Promise<RentalDetailResponse> {
    const response = await clientGet<{
        id: number;
        carSummary?: { id: number; brand: string; model: string; licensePlate: string; imageUrl?: string; status?: string; fuelType?: string; transmissionType?: string };
        userSummary?: { id: number; username: string; email: string; firstName?: string; lastName?: string; phone?: string };
        startDate: string;
        endDate: string;
        days: number;
        dailyPrice: number;
        totalPrice: number;
        currency: string;
        status: string;
        pickupNotes?: string;
        returnNotes?: string;
        approvalNotes?: string;
        cancellationReason?: string;
        createTime?: string;
        updateTime?: string;
    }>(`/api/rentals/${id}`);

    const statusMap: Record<string, AdminRentalStatus> = {
        'REQUESTED': 'PENDING',
        'Requested': 'PENDING',
        'CONFIRMED': 'CONFIRMED',
        'Confirmed': 'CONFIRMED',
        'IN_USE': 'ACTIVE',
        'In Use': 'ACTIVE',
        'RETURNED': 'COMPLETED',
        'Returned': 'COMPLETED',
        'CANCELLED': 'CANCELLED',
        'Cancelled': 'CANCELLED',
    };

    return {
        id: response.id,
        status: statusMap[response.status] ?? 'PENDING',
        startDate: response.startDate,
        endDate: response.endDate,
        duration: response.days,
        pricing: {
            dailyRate: response.dailyPrice,
            totalDays: response.days,
            subtotal: response.totalPrice,
            discounts: 0,
            finalTotal: response.totalPrice,
            currency: response.currency as 'USD' | 'EUR' | 'TRY',
        },
        customer: {
            id: response.userSummary?.id ?? 0,
            firstName: response.userSummary?.firstName ?? response.userSummary?.username ?? 'Unknown',
            lastName: response.userSummary?.lastName ?? '',
            email: response.userSummary?.email ?? '',
            phone: response.userSummary?.phone ?? '',
            emailVerified: true,
            phoneVerified: false,
            stats: { totalRentals: 0, totalSpent: 0, damageCount: 0 },
        },
        vehicle: {
            id: response.carSummary?.id ?? 0,
            brand: response.carSummary?.brand ?? 'Unknown',
            model: response.carSummary?.model ?? 'Unknown',
            licensePlate: response.carSummary?.licensePlate ?? '',
            imageUrl: response.carSummary?.imageUrl,
            status: 'Available' as CarStatus,
            fuelType: response.carSummary?.fuelType ?? '',
            transmissionType: response.carSummary?.transmissionType ?? '',
        },
        payment: {
            totalAmount: response.totalPrice,
            status: 'CAPTURED',
            method: 'card',
        },
        timeline: [
            { type: 'created' as const, timestamp: response.createTime ?? response.startDate },
        ],
        damages: [],
        notes: {
            approval: response.approvalNotes,
            pickup: response.pickupNotes,
            return: response.returnNotes,
            cancellation: response.cancellationReason,
        },
    };
}

export function useApproveRental() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: approveRental,
        onSuccess: (result) => {
            showToast.success(toastMessages.rental.approveSuccess);
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
            void queryClient.invalidateQueries({ queryKey: ['rentals'] });

            if (result.updatedSummary) {
                queryClient.setQueryData(adminKeys.summary(), result.updatedSummary);
            }
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.approveError, error.message);
        },
    });
}

export function useProcessPickup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: processPickup,
        onSuccess: (result) => {
            showToast.success(toastMessages.rental.pickupSuccess);
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
            void queryClient.invalidateQueries({ queryKey: ['rentals'] });

            if (result.updatedSummary) {
                queryClient.setQueryData(adminKeys.summary(), result.updatedSummary);
            }
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.pickupError, error.message);
        },
    });
}

export function useProcessReturn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: processReturn,
        onSuccess: (result) => {
            showToast.success(toastMessages.rental.returnSuccess);
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
            void queryClient.invalidateQueries({ queryKey: ['rentals'] });
            void queryClient.invalidateQueries({ queryKey: ['cars'] });

            if (result.updatedSummary) {
                queryClient.setQueryData(adminKeys.summary(), result.updatedSummary);
            }
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.returnError, error.message);
        },
    });
}

export function useRejectRental() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: rejectRental,
        onSuccess: (result) => {
            showToast.success(toastMessages.rental.rejectSuccess);
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
            void queryClient.invalidateQueries({ queryKey: ['rentals'] });

            if (result.updatedSummary) {
                queryClient.setQueryData(adminKeys.summary(), result.updatedSummary);
            }
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.rejectError, error.message);
        },
    });
}

export function useRentalDetail(id: number) {
    return useQuery({
        queryKey: adminKeys.rentalDetail(id),
        queryFn: () => fetchRentalDetail(id),
        staleTime: 30 * 1000,
        enabled: !!id,
    });
}
