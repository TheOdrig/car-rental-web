'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost } from '@/lib/api/client';
import { showToast, toastMessages } from '@/lib/utils/toast';
import type {
    DailySummary,
    FleetStatus,
    PendingItem,
    QuickActionResult,
    PageResponse,
    RevenueAnalytics,
    AdminAlert,
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
    revenue: () => [...adminKeys.all, 'revenue'] as const,
    alerts: () => [...adminKeys.all, 'alerts'] as const,
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

async function fetchRevenueAnalytics(): Promise<RevenueAnalytics> {
    return clientGet<RevenueAnalytics>('/api/admin/revenue');
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

async function approveRental({ rentalId, notes }: { rentalId: number; notes?: string }): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/approve`, { notes });
}

async function processPickup({ rentalId, notes }: { rentalId: number; notes?: string }): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/pickup`, { notes });
}

interface ProcessReturnData {
    notes?: string;
    condition?: string;
    damageReported?: boolean;
    finalMileage?: number;
}

async function processReturn({ rentalId, data }: { rentalId: number; data?: ProcessReturnData }): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/return`, data);
}

async function rejectRental({ rentalId, reason }: { rentalId: number; reason: string }): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/admin/rentals/${rentalId}/reject`, { reason });
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


export function useApproveRental() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: approveRental,
        onSuccess: (result) => {
            showToast.success(toastMessages.rental.approveSuccess);
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
            void queryClient.invalidateQueries({ queryKey: ['rentals'] });

            if (result.updatedSummary) {
                queryClient.setQueryData(adminKeys.summary(), result.updatedSummary);
            }
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.approveError, error.message);
        },
    });
}

export function useProcessPickup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: processPickup,
        onSuccess: (result) => {
            showToast.success(toastMessages.rental.pickupSuccess);
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
            void queryClient.invalidateQueries({ queryKey: ['rentals'] });

            if (result.updatedSummary) {
                queryClient.setQueryData(adminKeys.summary(), result.updatedSummary);
            }
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.pickupError, error.message);
        },
    });
}

export function useProcessReturn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: processReturn,
        onSuccess: (result) => {
            showToast.success(toastMessages.rental.returnSuccess);
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
            void queryClient.invalidateQueries({ queryKey: ['rentals'] });
            void queryClient.invalidateQueries({ queryKey: ['cars'] });

            if (result.updatedSummary) {
                queryClient.setQueryData(adminKeys.summary(), result.updatedSummary);
            }
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.returnError, error.message);
        },
    });
}

export function useRejectRental() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: rejectRental,
        onSuccess: (result) => {
            showToast.success(toastMessages.rental.rejectSuccess);
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
            void queryClient.invalidateQueries({ queryKey: ['rentals'] });

            if (result.updatedSummary) {
                queryClient.setQueryData(adminKeys.summary(), result.updatedSummary);
            }
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.rejectError, error.message);
        },
    });
}


interface CreateCarRequest {
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    vin?: string;
    fuelType: string;
    transmissionType: string;
    bodyType?: string;
    seats: number;
    color?: string;
    dailyRate: number;
    weeklyRate?: number;
    depositAmount?: number;
}

interface UpdateCarRequest extends CreateCarRequest {
    id: number;
}

interface CarResponse {
    id: number;
    brand: string;
    model: string;
    licensePlate: string;
}

async function createCar(data: CreateCarRequest): Promise<CarResponse> {
    return clientPost<CarResponse>('/api/admin/cars', data);
}

async function updateCar({ id, ...data }: UpdateCarRequest): Promise<CarResponse> {
    return clientPost<CarResponse>(`/api/admin/cars/${id}`, data);
}

export function useCreateCar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCar,
        onSuccess: (result) => {
            showToast.success('Car added successfully', `${result.brand} ${result.model} has been added to your fleet.`);
            void queryClient.invalidateQueries({ queryKey: adminKeys.fleet() });
            void queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
        onError: (error: Error) => {
            showToast.error('Failed to add car', error.message);
        },
    });
}

export function useUpdateCar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCar,
        onSuccess: (result) => {
            showToast.success('Car updated successfully', `${result.brand} ${result.model} has been updated.`);
            void queryClient.invalidateQueries({ queryKey: adminKeys.fleet() });
            void queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
        onError: (error: Error) => {
            showToast.error('Failed to update car', error.message);
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
        cars: () => queryClient.invalidateQueries({ queryKey: ['cars'] }),
    };
}
