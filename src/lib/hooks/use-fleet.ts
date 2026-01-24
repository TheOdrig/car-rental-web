'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost, clientDelete, clientPatch } from '@/lib/api/client';
import { showToast } from '@/lib/utils/toast';
import type { Car, PageResponse } from '@/types';

interface FleetFilters {
    status?: string;
    brand?: string;
    search?: string;
    page?: number;
    size?: number;
}

export const fleetKeys = {
    all: ['fleet'] as const,
    list: (filters?: FleetFilters) => [...fleetKeys.all, 'list', filters] as const,
    detail: (id: number) => [...fleetKeys.all, 'detail', id] as const,
};

async function fetchFleetList(filters?: FleetFilters): Promise<PageResponse<Car>> {
    const params = new URLSearchParams();

    if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
    }
    if (filters?.brand && filters.brand !== 'all') {
        params.append('brand', filters.brand);
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
    const url = queryString ? `/api/admin/cars?${queryString}` : '/api/admin/cars';

    return clientGet<PageResponse<Car>>(url);
}

async function deleteCar(id: number): Promise<void> {
    return clientDelete(`/api/admin/cars/${id}`);
}

async function changeCarStatus(params: { id: number; status: string }): Promise<Car> {
    return clientPost<Car>(`/api/admin/cars/${params.id}/status`, { status: params.status });
}

export function useFleetList(filters?: FleetFilters) {
    return useQuery({
        queryKey: fleetKeys.list(filters),
        queryFn: () => fetchFleetList(filters),
        staleTime: 2 * 60 * 1000,
    });
}

export function useFleetCar(id: number | null | undefined) {
    return useQuery({
        queryKey: fleetKeys.detail(id!),
        queryFn: () => clientGet<Car>(`/api/admin/cars/${id}`),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

export function useDeleteCar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCar,
        onSuccess: () => {
            showToast.success('Car deleted', 'The vehicle has been removed from your fleet.');
            void queryClient.invalidateQueries({ queryKey: fleetKeys.all });
            void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'fleet'] });
        },
        onError: (error: Error) => {
            showToast.error('Failed to delete car', error.message);
        },
    });
}

export function useChangeCarStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: changeCarStatus,
        onSuccess: (result) => {
            showToast.success('Status updated', `${result.brand} ${result.model} status has been changed.`);
            void queryClient.invalidateQueries({ queryKey: fleetKeys.all });
            void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'fleet'] });
        },
        onError: (error: Error) => {
            showToast.error('Failed to change status', error.message);
        },
    });
}

export function useInvalidateFleet() {
    const queryClient = useQueryClient();

    return {
        all: () => queryClient.invalidateQueries({ queryKey: fleetKeys.all }),
        list: () => queryClient.invalidateQueries({ queryKey: fleetKeys.list() }),
        single: (id: number) => queryClient.invalidateQueries({ queryKey: fleetKeys.detail(id) }),
    };
}
