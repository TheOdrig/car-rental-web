'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost } from '@/shared/api';
import { showToast } from '@/shared/lib';
import type {
    DailySummary,
    FleetStatus,
    PendingItem,
    RevenueAnalytics,
    AdminAlert,
} from '@/features/admin';
import type { PageResponse } from '@/shared/types';
import { adminKeys, type PendingFilters } from './admin-keys';

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

async function fetchRevenueAnalytics(): Promise<RevenueAnalytics> {
    return clientGet<RevenueAnalytics>('/api/admin/dashboard/revenue');
}

async function fetchAlerts(): Promise<AdminAlert[]> {
    return clientGet<AdminAlert[]>('/api/admin/alerts');
}

async function dismissAlert(alertId: string): Promise<void> {
    return clientPost<void>(`/api/admin/alerts/${alertId}/dismiss`);
}

async function markAllAlertsRead(): Promise<void> {
    return clientPost<void>('/api/admin/alerts/mark-all-read');
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

export function useRevenueData() {
    return useQuery({
        queryKey: adminKeys.revenue(),
        queryFn: fetchRevenueAnalytics,
        staleTime: 5 * 60 * 1000,
    });
}

export function useAlerts() {
    return useQuery({
        queryKey: adminKeys.alerts(),
        queryFn: fetchAlerts,
        staleTime: 60 * 1000,
    });
}

export function useDismissAlert() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: dismissAlert,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: adminKeys.alerts() });
        },
    });
}

export function useMarkAllAlertsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markAllAlertsRead,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: adminKeys.alerts() });
            showToast.success('All alerts marked as read');
        },
    });
}

export function useInvalidateAdmin() {
    const queryClient = useQueryClient();

    return {
        all: () => queryClient.refetchQueries({ queryKey: adminKeys.all }),
        dashboard: () => queryClient.refetchQueries({ queryKey: adminKeys.dashboard() }),
        summary: () => queryClient.refetchQueries({ queryKey: adminKeys.summary() }),
        fleet: () => queryClient.refetchQueries({ queryKey: adminKeys.fleet() }),
        pending: () => queryClient.refetchQueries({ queryKey: adminKeys.pending() }),
        cars: () => queryClient.refetchQueries({ queryKey: ['cars'] }),
        adminCars: () => queryClient.refetchQueries({ queryKey: adminKeys.cars() }),
    };
}
