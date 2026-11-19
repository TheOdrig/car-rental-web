'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminKeys, clientGet, clientPost, isApiError } from '@/shared/api';
import { showToast, toastMessages } from '@/shared/lib';
import { carKeys } from '@/entities/car';
import { getAdminActionErrorMessage, RENTAL_VALIDATION_FAILED_CODE, rentalKeys } from '@/entities/rental';
import { processKeys } from './process-keys';
import type {
    QuickActionResult,
    RentalDetailResponse,
    ApproveRentalRequest,
    RejectRentalRequest,
    ProcessPickupRequest,
    ProcessReturnRequest,
} from '../model/types';





async function approveRental({ rentalId, notes }: ApproveRentalRequest): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/approve`, { notes });
}

async function processPickup({ rentalId, notes }: ProcessPickupRequest): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/pickup`, { notes });
}

async function processReturn({ rentalId, data }: ProcessReturnRequest): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/return`, data);
}

async function processEarlyReturn({ rentalId, data }: ProcessReturnRequest): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/early-return`, data);
}

async function rejectRental({ rentalId, reason }: RejectRentalRequest): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/reject`, { reason });
}

async function fetchRentalDetail(id: number): Promise<RentalDetailResponse> {
    return clientGet<RentalDetailResponse>(`/api/admin/rentals/${id}/detail`);
}





export function useApproveRental() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: approveRental,
        onSuccess: () => {
            showToast.success(toastMessages.rental.approveSuccess);
            void queryClient.invalidateQueries({ queryKey: processKeys.all });
            void queryClient.invalidateQueries({ queryKey: rentalKeys.all });
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.approveError, getAdminActionErrorMessage(error));
        },
    });
}

export function useProcessPickup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: processPickup,
        onSuccess: () => {
            showToast.success(toastMessages.rental.pickupSuccess);
            void queryClient.invalidateQueries({ queryKey: processKeys.all });
            void queryClient.invalidateQueries({ queryKey: rentalKeys.all });
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.pickupError, getAdminActionErrorMessage(error));
            if (isApiError(error) && error.status === 400 && error.code === RENTAL_VALIDATION_FAILED_CODE) {
                void queryClient.invalidateQueries({ queryKey: processKeys.all });
                void queryClient.invalidateQueries({ queryKey: rentalKeys.all });
                void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
            }
        },
    });
}

export function useProcessReturn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: processReturn,
        onSuccess: () => {
            showToast.success(toastMessages.rental.returnSuccess);
            void queryClient.invalidateQueries({ queryKey: processKeys.all });
            void queryClient.invalidateQueries({ queryKey: rentalKeys.all });
            void queryClient.invalidateQueries({ queryKey: carKeys.all });
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.returnError, getAdminActionErrorMessage(error));
        },
    });
}

export function useProcessEarlyReturn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: processEarlyReturn,
        onSuccess: () => {
            showToast.success('Early return recorded', 'Unused days are refunded to the customer.');
            void queryClient.invalidateQueries({ queryKey: processKeys.all });
            void queryClient.invalidateQueries({ queryKey: rentalKeys.all });
            void queryClient.invalidateQueries({ queryKey: carKeys.all });
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
        },
        onError: (error: Error) => {
            showToast.error('Failed to record the early return', getAdminActionErrorMessage(error));
        },
    });
}

export function useRejectRental() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: rejectRental,
        onSuccess: () => {
            showToast.success(toastMessages.rental.rejectSuccess);
            void queryClient.invalidateQueries({ queryKey: processKeys.all });
            void queryClient.invalidateQueries({ queryKey: rentalKeys.all });
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.rejectError, getAdminActionErrorMessage(error));
        },
    });
}

export function useRentalDetail(id: number) {
    return useQuery({
        queryKey: processKeys.detail(id),
        queryFn: () => fetchRentalDetail(id),
        staleTime: 30 * 1000,
        enabled: !!id,
    });
}