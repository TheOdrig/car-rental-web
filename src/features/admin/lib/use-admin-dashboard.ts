'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminKeys, clientGet, clientPost, type PendingFilters, type Schemas } from '@/shared/api';
import { carKeys } from '@/entities/car';
import { showToast } from '@/shared/lib';
import type { DailySummary, FleetStatus, PendingItem, RevenueAnalytics, AdminAlert } from '@/features/admin';
import type { PageResponse } from '@/shared/types';
import type { AlertVariant } from '../model/types';

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

const ALERT_VARIANTS: Record<NonNullable<AlertDto['severity']>, AlertVariant> = {
    CRITICAL: 'critical',
    HIGH: 'critical',
    WARNING: 'warning',
    MEDIUM: 'warning',
    LOW: 'info',
};

type AlertDto = Schemas['AlertDto'];

export function toAdminAlert(alert: AlertDto): AdminAlert {
    return {
        id: String(alert.id ?? ''),
        type: alert.severity ? ALERT_VARIANTS[alert.severity] : 'info',
        title: alert.title ?? 'Alert',
        description: alert.message ?? '',
        timestamp: alert.createdAt ?? new Date().toISOString(),
        dismissible: true,
    };
}

async function fetchAlerts(): Promise<AdminAlert[]> {
    const alerts = await clientGet<AlertDto[]>('/api/admin/alerts');
    return alerts.filter((alert) => !alert.acknowledged).map(toAdminAlert);
}

async function acknowledgeAlert(alertId: string): Promise<void> {
    await clientPost<AlertDto>(`/api/admin/alerts/${alertId}/acknowledge`);
}

async function acknowledgeAllAlerts(): Promise<void> {
    const alerts = await clientGet<AlertDto[]>('/api/admin/alerts');
    await Promise.all(alerts.filter((alert) => !alert.acknowledged).map((alert) => acknowledgeAlert(String(alert.id))));
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
        mutationFn: acknowledgeAlert,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: adminKeys.alerts() });
        },
    });
}

export function useMarkAllAlertsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: acknowledgeAllAlerts,
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
        cars: () => queryClient.refetchQueries({ queryKey: carKeys.all }),
        adminCars: () => queryClient.refetchQueries({ queryKey: adminKeys.cars() }),
    };
}