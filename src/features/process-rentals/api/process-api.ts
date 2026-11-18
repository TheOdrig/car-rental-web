'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminKeys, clientGet, clientPost } from '@/shared/api';
import { showToast, toastMessages } from '@/shared/lib';
import { carKeys } from '@/entities/car';
import { getAdminActionErrorMessage, rentalKeys } from '@/entities/rental';
import { processKeys } from './process-keys';
import type {
    QuickActionResult,
    RentalDetailResponse,
    ApproveRentalRequest,
    RejectRentalRequest,
    ProcessPickupRequest,
    ProcessReturnRequest,
} from '../model/types';
import {
    publishRentalApproved,
    publishRentalRejected,
    publishPickupProcessed,
    publishReturnProcessed,
} from '../model/process-events';





async function approveRental({ rentalId, notes }: ApproveRentalRequest): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/approve`, { notes });
}

async function processPickup({ rentalId, notes }: ProcessPickupRequest): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/pickup`, { notes });
}

async function processReturn({ rentalId, data }: ProcessReturnRequest): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/return`, data);
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
        onSuccess: (result, variables) => {
            showToast.success(toastMessages.rental.approveSuccess);
            void queryClient.invalidateQueries({ queryKey: processKeys.all });
            void queryClient.invalidateQueries({ queryKey: rentalKeys.all });
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });


            publishRentalApproved({
                rentalId: variables.rentalId,
                notes: variables.notes,
            });
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
        onSuccess: (result, variables) => {
            showToast.success(toastMessages.rental.pickupSuccess);
            void queryClient.invalidateQueries({ queryKey: processKeys.all });
            void queryClient.invalidateQueries({ queryKey: rentalKeys.all });
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });


            publishPickupProcessed({
                rentalId: variables.rentalId,
                notes: variables.notes,
            });
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.pickupError, getAdminActionErrorMessage(error));
        },
    });
}

export function useProcessReturn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: processReturn,
        onSuccess: (result, variables) => {
            showToast.success(toastMessages.rental.returnSuccess);
            void queryClient.invalidateQueries({ queryKey: processKeys.all });
            void queryClient.invalidateQueries({ queryKey: rentalKeys.all });
            void queryClient.invalidateQueries({ queryKey: carKeys.all });
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });


            publishReturnProcessed({
                rentalId: variables.rentalId,
                hasDamage: typeof variables.data === 'object' ? variables.data.hasDamage : false,
            });
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.returnError, getAdminActionErrorMessage(error));
        },
    });
}

export function useRejectRental() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: rejectRental,
        onSuccess: (result, variables) => {
            showToast.success(toastMessages.rental.rejectSuccess);
            void queryClient.invalidateQueries({ queryKey: processKeys.all });
            void queryClient.invalidateQueries({ queryKey: rentalKeys.all });
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });


            publishRentalRejected({
                rentalId: variables.rentalId,
                reason: variables.reason,
            });
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