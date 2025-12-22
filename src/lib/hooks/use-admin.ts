'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost } from '@/lib/api/client';
import type {
    DailySummary,
    FleetStatus,
    PendingItem,
    QuickActionResult,
    PageResponse,
} from '@/types';

interface PendingFilters {
    page?: number;
    size?: number;
}

export const adminKeys = {
    all: ['admin'] as const,
    dashboard: () => [...adminKeys.all, 'dashboard'] as const,
    summary: () => [...adminKeys.dashboard(), 'summary'] as const,
    fleet: () => [...adminKeys.dashboard(), 'fleet'] as const,
    pending: () => [...adminKeys.dashboard(), 'pending'] as const,
    pendingApprovals: (filters?: PendingFilters) => [...adminKeys.pending(), 'approvals', filters] as const,
    pendingPickups: (filters?: PendingFilters) => [...adminKeys.pending(), 'pickups', filters] as const,
    pendingReturns: (filters?: PendingFilters) => [...adminKeys.pending(), 'returns', filters] as const,
    overdueRentals: (filters?: PendingFilters) => [...adminKeys.pending(), 'overdue', filters] as const,
};


async function fetchDashboardSummary(): Promise<DailySummary> {
    return clientGet<DailySummary>('/api/admin/dashboard');
}

async function fetchFleetStatus(): Promise<FleetStatus> {
    return clientGet<FleetStatus>('/api/admin/fleet');
}

async function fetchPendingApprovals(filters?: PendingFilters): Promise<PageResponse<PendingItem>> {
    const params = new URLSearchParams();

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });
    }

    const queryString = params.toString();
    const url = queryString
        ? `/api/admin/dashboard/pending/approvals?${queryString}`
        : '/api/admin/dashboard/pending/approvals';

    return clientGet<PageResponse<PendingItem>>(url);
}

async function fetchPendingPickups(filters?: PendingFilters): Promise<PageResponse<PendingItem>> {
    const params = new URLSearchParams();

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });
    }

    const queryString = params.toString();
    const url = queryString
        ? `/api/admin/dashboard/pending/pickups?${queryString}`
        : '/api/admin/dashboard/pending/pickups';

    return clientGet<PageResponse<PendingItem>>(url);
}

async function fetchPendingReturns(filters?: PendingFilters): Promise<PageResponse<PendingItem>> {
    const params = new URLSearchParams();

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });
    }

    const queryString = params.toString();
    const url = queryString
        ? `/api/admin/dashboard/pending/returns?${queryString}`
        : '/api/admin/dashboard/pending/returns';

    return clientGet<PageResponse<PendingItem>>(url);
}

async function fetchOverdueRentals(filters?: PendingFilters): Promise<PageResponse<PendingItem>> {
    const params = new URLSearchParams();

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });
    }

    const queryString = params.toString();
    const url = queryString
        ? `/api/admin/dashboard/pending/overdue?${queryString}`
        : '/api/admin/dashboard/pending/overdue';

    return clientGet<PageResponse<PendingItem>>(url);
}

async function approveRental(rentalId: number): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/approve`);
}

async function processPickup(rentalId: number): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/pickup`);
}

async function processReturn(rentalId: number): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/return`);
}


export function useDashboardSummary() {
    return useQuery({
        queryKey: adminKeys.summary(),
        queryFn: fetchDashboardSummary,
        staleTime: 30 * 1000,
        refetchInterval: 60 * 1000,
    });
}

export function useFleetStatus() {
    return useQuery({
        queryKey: adminKeys.fleet(),
        queryFn: fetchFleetStatus,
        staleTime: 60 * 1000,
    });
}

export function usePendingApprovals(filters?: PendingFilters) {
    return useQuery({
        queryKey: adminKeys.pendingApprovals(filters),
        queryFn: () => fetchPendingApprovals(filters),
        staleTime: 30 * 1000,
    });
}

export function usePendingPickups(filters?: PendingFilters) {
    return useQuery({
        queryKey: adminKeys.pendingPickups(filters),
        queryFn: () => fetchPendingPickups(filters),
        staleTime: 30 * 1000,
    });
}

export function usePendingReturns(filters?: PendingFilters) {
    return useQuery({
        queryKey: adminKeys.pendingReturns(filters),
        queryFn: () => fetchPendingReturns(filters),
        staleTime: 30 * 1000,
    });
}

export function useOverdueRentals(filters?: PendingFilters) {
    return useQuery({
        queryKey: adminKeys.overdueRentals(filters),
        queryFn: () => fetchOverdueRentals(filters),
        staleTime: 30 * 1000,
    });
}


export function useApproveRental() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: approveRental,
        onSuccess: (result) => {
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
            void queryClient.invalidateQueries({ queryKey: ['rentals'] });

            if (result.updatedSummary) {
                queryClient.setQueryData(adminKeys.summary(), result.updatedSummary);
            }
        },
    });
}

export function useProcessPickup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: processPickup,
        onSuccess: (result) => {
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
            void queryClient.invalidateQueries({ queryKey: ['rentals'] });

            if (result.updatedSummary) {
                queryClient.setQueryData(adminKeys.summary(), result.updatedSummary);
            }
        },
    });
}

export function useProcessReturn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: processReturn,
        onSuccess: (result) => {
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
            void queryClient.invalidateQueries({ queryKey: ['rentals'] });
            void queryClient.invalidateQueries({ queryKey: ['cars'] });

            if (result.updatedSummary) {
                queryClient.setQueryData(adminKeys.summary(), result.updatedSummary);
            }
        },
    });
}


export function useInvalidateAdmin() {
    const queryClient = useQueryClient();

    return {
        all: () => queryClient.invalidateQueries({ queryKey: adminKeys.all }),
        dashboard: () => queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() }),
        summary: () => queryClient.invalidateQueries({ queryKey: adminKeys.summary() }),
        fleet: () => queryClient.invalidateQueries({ queryKey: adminKeys.fleet() }),
        pending: () => queryClient.invalidateQueries({ queryKey: adminKeys.pending() }),
    };
}
