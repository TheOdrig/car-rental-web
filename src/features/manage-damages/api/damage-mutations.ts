'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientPost, clientPut, clientDelete, getApiErrorMessage, getSafeErrorMessage } from '@/shared/api';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { withQuery } from '@/shared/lib/url';
import { showToast } from '@/shared/lib';
import { adminKeys, processKeys, rentalKeys } from '@/entities/rental';
import {
    damageKeys,
    type DamageReport,
    type DamageReportRequest,
    type DamageAssessmentRequest,
    type DamageDisputeRequest,
    type DamageDisputeResolution,
    type DamageChargeResult,
} from '@/entities/damage';

async function createDamage(
    rentalId: number,
    request: DamageReportRequest
): Promise<DamageReport> {
    return clientPost<DamageReport>(withQuery(ENDPOINTS.admin.damages, `rentalId=${rentalId}`), request);
}

async function reassessDamage(
    damageId: number,
    request: DamageAssessmentRequest
): Promise<DamageReport> {
    return clientPut<DamageReport>(ENDPOINTS.admin.damageAssess(damageId), request);
}

async function assessDamage(
    damageId: number,
    request: DamageAssessmentRequest
): Promise<DamageReport> {
    return clientPost<DamageReport>(ENDPOINTS.admin.damageAssess(damageId), request);
}

async function disputeDamage(
    damageId: number,
    request: DamageDisputeRequest
): Promise<DamageReport> {
    return clientPost<DamageReport>(ENDPOINTS.damages.dispute(damageId), request);
}

async function resolveDamage(
    damageId: number,
    resolution: DamageDisputeResolution
): Promise<DamageReport> {
    return clientPost<DamageReport>(ENDPOINTS.admin.damageResolve(damageId), resolution);
}

async function chargeDamage(damageId: number): Promise<DamageChargeResult> {
    return clientPost<DamageChargeResult>(ENDPOINTS.admin.damageCharge(damageId));
}

async function uploadPhotos(damageId: number, formData: FormData): Promise<DamageReport> {
    return clientPost<DamageReport>(ENDPOINTS.admin.damagePhotos(damageId), formData);
}

async function deletePhoto(damageId: number, photoId: number): Promise<void> {
    await clientDelete<void>(withQuery(ENDPOINTS.admin.damagePhotos(damageId), `photoId=${photoId}`));
}

export function useCreateDamage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ rentalId, request }: { rentalId: number; request: DamageReportRequest }) =>
            createDamage(rentalId, request),
        onSuccess: () => {
            showToast.success('Damage report created successfully');
            void queryClient.invalidateQueries({ queryKey: damageKeys.all });
        },
        onError: (error: Error) => {
            showToast.error('Failed to create damage report', error.message);
        },
    });
}

export function useUploadPhotos() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ damageId, formData }: { damageId: number; formData: FormData }) =>
            uploadPhotos(damageId, formData),
        onSuccess: (_, variables) => {
            showToast.success('Photos uploaded successfully');
            void queryClient.invalidateQueries({ queryKey: damageKeys.detail(variables.damageId) });
        },
        onError: (error: Error) => {
            showToast.error('Failed to upload photos', getSafeErrorMessage(error, 'The photos could not be stored. Please try again later.'));
        },
    });
}

export function useDeletePhoto() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ damageId, photoId }: { damageId: number; photoId: number }) =>
            deletePhoto(damageId, photoId),
        onSuccess: (_, variables) => {
            showToast.success('Photo deleted successfully');
            void queryClient.invalidateQueries({ queryKey: damageKeys.detail(variables.damageId) });
        },
        onError: (error: Error) => {
            showToast.error('Failed to delete photo', error.message);
        },
    });
}

export function useAssessDamage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ damageId, request }: { damageId: number; request: DamageAssessmentRequest }) =>
            assessDamage(damageId, request),
        onSuccess: (_, variables) => {
            showToast.success('Damage assessed successfully');
            void queryClient.invalidateQueries({ queryKey: damageKeys.detail(variables.damageId) });
            void queryClient.invalidateQueries({ queryKey: damageKeys.lists() });
        },
        onError: (error: Error) => {
            showToast.error('Failed to assess damage', getApiErrorMessage(error));
        },
    });
}

export function useReassessDamage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ damageId, request }: { damageId: number; request: DamageAssessmentRequest }) =>
            reassessDamage(damageId, request),
        onSuccess: (_, variables) => {
            showToast.success('Assessment updated');
            void queryClient.invalidateQueries({ queryKey: damageKeys.detail(variables.damageId) });
            void queryClient.invalidateQueries({ queryKey: damageKeys.lists() });
        },
        onError: (error: Error) => {
            showToast.error('Failed to update the assessment', getApiErrorMessage(error));
        },
    });
}

export function useDisputeDamage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ damageId, request }: { damageId: number; request: DamageDisputeRequest }) =>
            disputeDamage(damageId, request),
        onSuccess: (_, variables) => {
            showToast.success('Dispute submitted successfully');
            void queryClient.invalidateQueries({ queryKey: damageKeys.detail(variables.damageId) });
            void queryClient.invalidateQueries({ queryKey: damageKeys.myDamages() });
        },
        onError: (error: Error) => {
            showToast.error('Failed to submit dispute', error.message);
        },
    });
}

export function useResolveDamage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ damageId, resolution }: { damageId: number; resolution: DamageDisputeResolution }) =>
            resolveDamage(damageId, resolution),
        onSuccess: (_, variables) => {
            showToast.success('Dispute resolved successfully');
            void queryClient.invalidateQueries({ queryKey: damageKeys.detail(variables.damageId) });
            void queryClient.invalidateQueries({ queryKey: damageKeys.lists() });
        },
        onError: (error: Error) => {
            showToast.error('Failed to resolve dispute', error.message);
        },
    });
}

export function useChargeDamage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (damageId: number) => chargeDamage(damageId),
        onSuccess: (result) => {
            if (result.charged) {
                showToast.success('Customer charged', result.message);
            } else {
                showToast.warning('Charge was not completed', result.message);
            }
            void queryClient.invalidateQueries({ queryKey: damageKeys.all });
            void queryClient.invalidateQueries({ queryKey: adminKeys.revenue() });
            void queryClient.invalidateQueries({ queryKey: processKeys.all });
            void queryClient.invalidateQueries({ queryKey: rentalKeys.all });
        },
        onError: (error: Error) => {
            showToast.error('Failed to charge customer', getApiErrorMessage(error));
        },
    });
}
