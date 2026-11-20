'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost, isApiError, type Schemas } from '@/shared/api';
import { adminKeys, type PendingFilters } from '@/entities/rental';
import { carKeys } from '@/entities/car';
import { showToast } from '@/shared/lib';
import type { DailySummary, FleetStatus, PendingItem, RevenueAnalytics, AdminAlert } from '../model/types';
import type { PageResponse } from '@/shared/types';
import type { AlertVariant } from '../model/types';
import { STALE_TIME } from '@/shared/config/constants';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { withQuery } from '@/shared/lib/url';

async function fetchDashboardSummary(): Promise<DailySummary> {
    return clientGet<DailySummary>(ENDPOINTS.admin.dashboard);
}

async function fetchFleetStatus(): Promise<FleetStatus> {
    return clientGet<FleetStatus>(ENDPOINTS.admin.fleet);
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
    const url = withQuery(ENDPOINTS.admin.pendingApprovals, queryString);

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
    const url = withQuery(ENDPOINTS.admin.pendingPickups, queryString);

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
    const url = withQuery(ENDPOINTS.admin.pendingReturns, queryString);

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
    const url = withQuery(ENDPOINTS.admin.pendingOverdue, queryString);

    return clientGet<PageResponse<PendingItem>>(url);
}

async function fetchRevenueAnalytics(): Promise<RevenueAnalytics> {
    return clientGet<RevenueAnalytics>(ENDPOINTS.admin.revenue);
}

const ALERT_VARIANTS: Record<NonNullable<AlertDto['severity']>, AlertVariant> = {
    CRITICAL: 'critical',
    HIGH: 'critical',
    WARNING: 'warning',
    MEDIUM: 'warning',
    LOW: 'info',
};

type AlertDto = Schemas['AlertDto'];

const ADMIN_PATH = /^\/admin(?:\/[A-Za-z0-9_~-]+)*\/?$/;

export function safeAlertTarget(actionUrl: string | undefined): string | undefined {
    const value = actionUrl?.trim();
    return value && ADMIN_PATH.test(value) ? value : undefined;
}

export function toAdminAlert(alert: AlertDto): AdminAlert {
    return {
        id: String(alert.id ?? ''),
        type: alert.severity ? ALERT_VARIANTS[alert.severity] : 'info',
        title: alert.title ?? 'Alert',
        description: alert.message ?? '',
        timestamp: alert.createdAt ?? new Date().toISOString(),
        actionUrl: safeAlertTarget(alert.actionUrl),
        dismissible: true,
    };
}

async function fetchAlerts(): Promise<AdminAlert[]> {
    const alerts = await clientGet<AlertDto[]>(ENDPOINTS.admin.alerts);
    return alerts.filter((alert) => !alert.acknowledged).map(toAdminAlert);
}

async function acknowledgeAlert(alertId: string): Promise<void> {
    await clientPost<AlertDto>(ENDPOINTS.admin.alertAcknowledge(alertId));
}

async function acknowledgeAllAlerts(): Promise<void> {
    const alerts = await clientGet<AlertDto[]>(ENDPOINTS.admin.alerts);
    await Promise.all(alerts.filter((alert) => !alert.acknowledged).map((alert) => acknowledgeAlert(String(alert.id))));
}

export function useDashboardSummary() {
    return useQuery({
        queryKey: adminKeys.summary(),
        queryFn: fetchDashboardSummary,
        staleTime: STALE_TIME.SHORT,
        refetchInterval: 60 * 1000,
    });
}

export function useFleetStatus() {
    return useQuery({
        queryKey: adminKeys.fleet(),
        queryFn: fetchFleetStatus,
        staleTime: STALE_TIME.MINUTE,
    });
}

export function usePendingApprovals(filters?: PendingFilters) {
    return useQuery({
        queryKey: adminKeys.pendingApprovals(filters),
        queryFn: () => fetchPendingApprovals(filters),
        staleTime: STALE_TIME.SHORT,
    });
}

export function usePendingPickups(filters?: PendingFilters) {
    return useQuery({
        queryKey: adminKeys.pendingPickups(filters),
        queryFn: () => fetchPendingPickups(filters),
        staleTime: STALE_TIME.SHORT,
    });
}

export function usePendingReturns(filters?: PendingFilters) {
    return useQuery({
        queryKey: adminKeys.pendingReturns(filters),
        queryFn: () => fetchPendingReturns(filters),
        staleTime: STALE_TIME.SHORT,
    });
}

export function useOverdueRentals(filters?: PendingFilters) {
    return useQuery({
        queryKey: adminKeys.overdueRentals(filters),
        queryFn: () => fetchOverdueRentals(filters),
        staleTime: STALE_TIME.SHORT,
    });
}

export function useRevenueData() {
    return useQuery({
        queryKey: adminKeys.revenue(),
        queryFn: fetchRevenueAnalytics,
        staleTime: STALE_TIME.LONG,
    });
}

export function useAlerts() {
    return useQuery({
        queryKey: adminKeys.alerts(),
        queryFn: fetchAlerts,
        staleTime: STALE_TIME.MINUTE,
    });
}

export function useDismissAlert() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (alertId: string) => {
            try {
                await acknowledgeAlert(alertId);
            } catch (error) {
                if (!isApiError(error) || error.status !== 409) throw error;
            }
        },
        onSettled: () => {
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