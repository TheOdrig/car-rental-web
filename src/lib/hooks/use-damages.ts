'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost, clientDelete } from '@/lib/api/client';
import { showToast } from '@/lib/utils/toast';
import type {
    DamageReport,
    DamageStatistics,
    DamageSearchFilters,
    DamageReportRequest,
    DamageAssessmentRequest,
    DamageDisputeRequest,
    DamageDisputeResolution,
    DamageListResponse,
} from '@/types';

export const damageKeys = {
    all: ['damages'] as const,
    lists: () => [...damageKeys.all, 'list'] as const,
    list: (filters?: DamageSearchFilters) => [...damageKeys.lists(), filters] as const,
    myDamages: () => [...damageKeys.all, 'my'] as const,
    myList: (page?: number, size?: number) => [...damageKeys.myDamages(), { page, size }] as const,
    details: () => [...damageKeys.all, 'detail'] as const,
    detail: (id: number) => [...damageKeys.details(), id] as const,
    statistics: (startDate?: string, endDate?: string) => [...damageKeys.all, 'statistics', { startDate, endDate }] as const,
    vehicleHistory: (carId: number) => [...damageKeys.all, 'vehicle', carId] as const,
    customerHistory: (userId: number) => [...damageKeys.all, 'customer', userId] as const,
};

function buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
        }
    });
    return searchParams.toString();
}

async function fetchDamages(
    filters?: DamageSearchFilters,
    page = 0,
    size = 20
): Promise<DamageListResponse> {
    const params = { ...filters, page, size };
    const queryString = buildQueryString(params);
    const url = queryString ? `/api/admin/damages?${queryString}` : '/api/admin/damages';
    return clientGet<DamageListResponse>(url);
}

async function fetchMyDamages(page = 0, size = 20): Promise<DamageListResponse> {
    const queryString = buildQueryString({ page, size });
    const url = queryString ? `/api/damages/me?${queryString}` : '/api/damages/me';
    return clientGet<DamageListResponse>(url);
}

async function fetchDamageDetail(id: number): Promise<DamageReport> {
    return clientGet<DamageReport>(`/api/admin/damages/${id}`);
}

async function fetchDamageStatistics(
    startDate?: string,
    endDate?: string
): Promise<DamageStatistics> {
    const queryString = buildQueryString({ startDate, endDate });
    const url = queryString
        ? `/api/admin/damages/statistics?${queryString}`
        : '/api/admin/damages/statistics';
    return clientGet<DamageStatistics>(url);
}

async function fetchVehicleDamages(
    carId: number,
    page = 0,
    size = 10
): Promise<DamageListResponse> {
    const queryString = buildQueryString({ page, size });
    const url = queryString
        ? `/api/admin/damages/vehicle/${carId}?${queryString}`
        : `/api/admin/damages/vehicle/${carId}`;
    return clientGet<DamageListResponse>(url);
}

async function fetchCustomerDamages(
    userId: number,
    page = 0,
    size = 10
): Promise<DamageListResponse> {
    const queryString = buildQueryString({ page, size });
    const url = queryString
        ? `/api/admin/damages/customer/${userId}?${queryString}`
        : `/api/admin/damages/customer/${userId}`;
    return clientGet<DamageListResponse>(url);
}

async function createDamage(
    rentalId: number,
    request: DamageReportRequest
): Promise<DamageReport> {
    return clientPost<DamageReport>(`/api/admin/damages?rentalId=${rentalId}`, request);
}

async function assessDamage(
    damageId: number,
    request: DamageAssessmentRequest
): Promise<DamageReport> {
    return clientPost<DamageReport>(`/api/admin/damages/${damageId}/assess`, request);
}

async function disputeDamage(
    damageId: number,
    request: DamageDisputeRequest
): Promise<DamageReport> {
    return clientPost<DamageReport>(`/api/damages/${damageId}/dispute`, request);
}

async function resolveDamage(
    damageId: number,
    resolution: DamageDisputeResolution
): Promise<DamageReport> {
    return clientPost<DamageReport>(`/api/admin/damages/${damageId}/resolve`, resolution);
}

async function uploadPhotos(damageId: number, formData: FormData): Promise<DamageReport> {
    const response = await fetch(`/api/admin/damages/${damageId}/photos`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload photos');
    }

    return response.json();
}

async function deletePhoto(damageId: number, photoId: number): Promise<void> {
    await clientDelete<void>(`/api/admin/damages/${damageId}/photos/${photoId}`);
}

export function useDamages(filters?: DamageSearchFilters, page = 0, size = 20) {
    return useQuery({
        queryKey: damageKeys.list({ ...filters, page, size } as DamageSearchFilters),
        queryFn: () => fetchDamages(filters, page, size),
        staleTime: 30 * 1000,
    });
}

export function useMyDamages(page = 0, size = 20) {
    return useQuery({
        queryKey: damageKeys.myList(page, size),
        queryFn: () => fetchMyDamages(page, size),
        staleTime: 30 * 1000,
    });
}

export function useDamageDetail(id: number | null | undefined) {
    return useQuery({
        queryKey: damageKeys.detail(id!),
        queryFn: () => fetchDamageDetail(id!),
        enabled: !!id,
        staleTime: 60 * 1000,
    });
}

export function useDamageStatistics(startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: damageKeys.statistics(startDate, endDate),
        queryFn: () => fetchDamageStatistics(startDate, endDate),
        staleTime: 5 * 60 * 1000,
    });
}

export function useVehicleDamages(carId: number | null | undefined, page = 0, size = 10) {
    return useQuery({
        queryKey: damageKeys.vehicleHistory(carId!),
        queryFn: () => fetchVehicleDamages(carId!, page, size),
        enabled: !!carId,
        staleTime: 60 * 1000,
    });
}

export function useCustomerDamages(userId: number | null | undefined, page = 0, size = 10) {
    return useQuery({
        queryKey: damageKeys.customerHistory(userId!),
        queryFn: () => fetchCustomerDamages(userId!, page, size),
        enabled: !!userId,
        staleTime: 60 * 1000,
    });
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
            showToast.error('Failed to upload photos', error.message);
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
            showToast.error('Failed to assess damage', error.message);
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

export function useInvalidateDamages() {
    const queryClient = useQueryClient();

    return {
        all: () => queryClient.invalidateQueries({ queryKey: damageKeys.all }),
        lists: () => queryClient.invalidateQueries({ queryKey: damageKeys.lists() }),
        myDamages: () => queryClient.invalidateQueries({ queryKey: damageKeys.myDamages() }),
        single: (id: number) => queryClient.invalidateQueries({ queryKey: damageKeys.detail(id) }),
        statistics: () => queryClient.invalidateQueries({ queryKey: [...damageKeys.all, 'statistics'] }),
    };
}
