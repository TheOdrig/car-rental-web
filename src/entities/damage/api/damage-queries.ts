'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clientGet, isNotFoundError } from '@/shared/api';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { withQuery } from '@/shared/lib/url';
import type {
    DamageReport,
    DamageStatistics,
    DamageSearchFilters,
    DamageListResponse,
} from '../model/types';
import { STALE_TIME } from '@/shared/config/constants';

export const damageKeys = {
    all: ['damages'] as const,
    lists: () => [...damageKeys.all, 'list'] as const,
    list: (filters?: DamageSearchFilters) => [...damageKeys.lists(), filters] as const,
    myDamages: () => [...damageKeys.all, 'my'] as const,
    myList: (page?: number, size?: number) => [...damageKeys.myDamages(), { page, size }] as const,
    myDetail: (id: number) => [...damageKeys.myDamages(), 'detail', id] as const,
    details: () => [...damageKeys.all, 'detail'] as const,
    detail: (id: number) => [...damageKeys.details(), id] as const,
    statistics: (startDate?: string, endDate?: string) => [...damageKeys.all, 'statistics', { startDate, endDate }] as const,
    vehicleHistory: (carId: number, page?: number, size?: number) => [...damageKeys.all, 'vehicle', carId, { page, size }] as const,
    customerHistory: (userId: number, page?: number, size?: number) => [...damageKeys.all, 'customer', userId, { page, size }] as const,
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
    const url = withQuery(ENDPOINTS.admin.damages, queryString);
    return clientGet<DamageListResponse>(url);
}

async function fetchMyDamages(page = 0, size = 20): Promise<DamageListResponse> {
    const queryString = buildQueryString({ page, size });
    const url = withQuery(ENDPOINTS.damages.mine, queryString);
    return clientGet<DamageListResponse>(url);
}

async function fetchMyDamageById(id: number): Promise<DamageReport | null> {
    try {
        const damage = await clientGet<DamageReport>(ENDPOINTS.damages.detail(id));
        return { ...damage, photos: damage.photos ?? [] };
    } catch (error) {
        if (isNotFoundError(error)) return null;
        throw error;
    }
}

async function fetchDamageDetail(id: number): Promise<DamageReport> {
    return clientGet<DamageReport>(ENDPOINTS.admin.damage(id));
}

async function fetchDamageStatistics(
    startDate?: string,
    endDate?: string
): Promise<DamageStatistics> {
    const queryString = buildQueryString({ startDate, endDate });
    const url = withQuery(ENDPOINTS.admin.damageStatistics, queryString);
    return clientGet<DamageStatistics>(url);
}

async function fetchVehicleDamages(
    carId: number,
    page = 0,
    size = 10
): Promise<DamageListResponse> {
    const queryString = buildQueryString({ page, size });
    const url = withQuery(ENDPOINTS.admin.damagesByVehicle(carId), queryString);
    return clientGet<DamageListResponse>(url);
}

async function fetchCustomerDamages(
    userId: number,
    page = 0,
    size = 10
): Promise<DamageListResponse> {
    const queryString = buildQueryString({ page, size });
    const url = withQuery(ENDPOINTS.admin.damagesByCustomer(userId), queryString);
    return clientGet<DamageListResponse>(url);
}

export function useDamages(filters?: DamageSearchFilters, page = 0, size = 20, enabled = true) {
    return useQuery({
        queryKey: damageKeys.list({ ...filters, page, size } as DamageSearchFilters),
        queryFn: () => fetchDamages(filters, page, size),
        enabled,
        staleTime: STALE_TIME.SHORT,
    });
}

export function useMyDamages(page = 0, size = 20) {
    return useQuery({
        queryKey: damageKeys.myList(page, size),
        queryFn: () => fetchMyDamages(page, size),
        staleTime: STALE_TIME.SHORT,
    });
}

export function useDamageDetail(id: number | null | undefined) {
    return useQuery({
        queryKey: damageKeys.detail(id!),
        queryFn: () => fetchDamageDetail(id!),
        enabled: !!id,
        staleTime: STALE_TIME.MINUTE,
    });
}

export function useMyDamageDetail(id: number | null | undefined) {
    return useQuery({
        queryKey: damageKeys.myDetail(id!),
        queryFn: () => fetchMyDamageById(id!),
        enabled: !!id,
        staleTime: STALE_TIME.SHORT,
    });
}

export function useDamageStatistics(startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: damageKeys.statistics(startDate, endDate),
        queryFn: () => fetchDamageStatistics(startDate, endDate),
        staleTime: STALE_TIME.LONG,
    });
}

export function useVehicleDamages(carId: number | null | undefined, page = 0, size = 10) {
    return useQuery({
        queryKey: damageKeys.vehicleHistory(carId!, page, size),
        queryFn: () => fetchVehicleDamages(carId!, page, size),
        enabled: !!carId,
        staleTime: STALE_TIME.MINUTE,
    });
}

export function useCustomerDamages(userId: number | null | undefined, page = 0, size = 10) {
    return useQuery({
        queryKey: damageKeys.customerHistory(userId!, page, size),
        queryFn: () => fetchCustomerDamages(userId!, page, size),
        enabled: !!userId,
        staleTime: STALE_TIME.MINUTE,
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
