'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost, clientDelete, clientPut, clientPatch } from '@/lib/api/client';
import { showToast, toastMessages } from '@/lib/utils/toast';
import type {
    DailySummary,
    FleetStatus,
    PendingItem,
    QuickActionResult,
    PageResponse,
    RevenueAnalytics,
    AdminAlert,
    ProcessReturnData,
    Car,
    CarStatus,
    RentalDetailResponse,
    VehicleDetailResponse,
    CustomerDetailResponse,
    RentalHistoryItem,
    PaginatedResponse,
    AdminNote,
    AdminRentalStatus,
    CurrencyType,
} from '@/types';

interface PendingFilters {
    page?: number;
    size?: number;
}

export interface AdminCarsFilters {
    page?: number;
    size?: number;
    status?: string;
    brand?: string;
    search?: string;
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
    cars: () => [...adminKeys.all, 'cars'] as const,
    carsList: (filters?: AdminCarsFilters) => [...adminKeys.cars(), 'list', filters] as const,
    rentals: () => [...adminKeys.all, 'rentals'] as const,
    rentalDetail: (id: number) => [...adminKeys.rentals(), id] as const,
    vehicleDetail: (id: number) => [...adminKeys.cars(), id] as const,
    vehicleRentalHistory: (id: number, page: number) => [...adminKeys.cars(), id, 'rentals', page] as const,
    users: () => [...adminKeys.all, 'users'] as const,
    customerDetail: (id: number) => [...adminKeys.users(), id] as const,
    customerRentalHistory: (id: number, page: number, status?: string) => [...adminKeys.users(), id, 'rentals', page, status] as const,
    customerNotes: (id: number) => [...adminKeys.users(), id, 'notes'] as const,
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

async function approveRental({ rentalId, notes }: { rentalId: number; notes?: string }): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/rentals/${rentalId}/confirm`, { notes });
}

async function processPickup({ rentalId, notes }: { rentalId: number; notes?: string }): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/rentals/${rentalId}/pickup`, { notes });
}

async function processReturn({ rentalId, data }: { rentalId: number; data?: string | ProcessReturnData }): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/rentals/${rentalId}/return`, data);
}

async function rejectRental({ rentalId, reason }: { rentalId: number; reason: string }): Promise<QuickActionResult> {
    return clientPost<QuickActionResult>(`/api/rentals/${rentalId}/cancel`, { reason });
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
            void queryClient.invalidateQueries({ queryKey: adminKeys.cars() });
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
        all: () => queryClient.refetchQueries({ queryKey: adminKeys.all }),
        dashboard: () => queryClient.refetchQueries({ queryKey: adminKeys.dashboard() }),
        summary: () => queryClient.refetchQueries({ queryKey: adminKeys.summary() }),
        fleet: () => queryClient.refetchQueries({ queryKey: adminKeys.fleet() }),
        pending: () => queryClient.refetchQueries({ queryKey: adminKeys.pending() }),
        cars: () => queryClient.refetchQueries({ queryKey: ['cars'] }),
        adminCars: () => queryClient.refetchQueries({ queryKey: adminKeys.cars() }),
    };
}


async function fetchAdminCars(filters?: AdminCarsFilters): Promise<PageResponse<Car>> {
    const params = new URLSearchParams();

    if (filters) {
        if (filters.page !== undefined) params.append('page', String(filters.page));
        if (filters.size !== undefined) params.append('size', String(filters.size));
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.brand && filters.brand !== 'all') params.append('brand', filters.brand);
        if (filters.search) params.append('search', filters.search);
    }

    const queryString = params.toString();
    const url = queryString ? `/api/admin/cars?${queryString}` : '/api/admin/cars';

    return clientGet<PageResponse<Car>>(url);
}

async function deleteCar(carId: number): Promise<void> {
    return clientDelete<void>(`/api/admin/cars/${carId}`);
}

async function updateCarStatus({ carId, status, reason }: { carId: number; status: string; reason?: string }): Promise<Car> {
    return clientPost<Car>(`/api/admin/cars/${carId}/status`, { status, reason });
}

export function useAdminCars(filters?: AdminCarsFilters) {
    return useQuery({
        queryKey: adminKeys.carsList(filters),
        queryFn: () => fetchAdminCars(filters),
        staleTime: 30 * 1000,
    });
}

export function useDeleteCar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCar,
        onSuccess: () => {
            showToast.success('Car removed from fleet', 'The vehicle has been permanently deleted.');
            void queryClient.invalidateQueries({ queryKey: adminKeys.cars() });
            void queryClient.invalidateQueries({ queryKey: adminKeys.fleet() });
            void queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
        onError: (error: Error) => {
            showToast.error('Failed to remove car', error.message);
        },
    });
}

export function useUpdateCarStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCarStatus,
        onSuccess: (result) => {
            showToast.success('Car status updated', `${result.brand} ${result.model} is now ${result.carStatusType}.`);
            void queryClient.invalidateQueries({ queryKey: adminKeys.cars() });
            void queryClient.refetchQueries({ queryKey: adminKeys.fleet() });
            void queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
        onError: (error: Error) => {
            showToast.error('Failed to update status', error.message);
        },
    });
}

async function fetchRentalDetail(id: number): Promise<RentalDetailResponse> {
    const response = await clientGet<{
        id: number;
        carSummary?: { id: number; brand: string; model: string; licensePlate: string; imageUrl?: string; status?: string; fuelType?: string; transmissionType?: string };
        userSummary?: { id: number; username: string; email: string; firstName?: string; lastName?: string; phone?: string };
        startDate: string;
        endDate: string;
        days: number;
        dailyPrice: number;
        totalPrice: number;
        currency: string;
        status: string;
        pickupNotes?: string;
        returnNotes?: string;
        approvalNotes?: string;
        cancellationReason?: string;
        createTime?: string;
        updateTime?: string;
    }>(`/api/rentals/${id}`);

    const statusMap: Record<string, AdminRentalStatus> = {
        'REQUESTED': 'PENDING',
        'Requested': 'PENDING',
        'CONFIRMED': 'CONFIRMED',
        'Confirmed': 'CONFIRMED',
        'IN_USE': 'ACTIVE',
        'In Use': 'ACTIVE',
        'RETURNED': 'COMPLETED',
        'Returned': 'COMPLETED',
        'CANCELLED': 'CANCELLED',
        'Cancelled': 'CANCELLED',
    };

    return {
        id: response.id,
        status: statusMap[response.status] ?? 'PENDING',
        startDate: response.startDate,
        endDate: response.endDate,
        duration: response.days,
        pricing: {
            dailyRate: response.dailyPrice,
            totalDays: response.days,
            subtotal: response.totalPrice,
            discounts: 0,
            finalTotal: response.totalPrice,
            currency: response.currency as 'USD' | 'EUR' | 'TRY',
        },
        customer: {
            id: response.userSummary?.id ?? 0,
            firstName: response.userSummary?.firstName ?? response.userSummary?.username ?? 'Unknown',
            lastName: response.userSummary?.lastName ?? '',
            email: response.userSummary?.email ?? '',
            phone: response.userSummary?.phone ?? '',
            emailVerified: true,
            phoneVerified: false,
            stats: { totalRentals: 0, totalSpent: 0, damageCount: 0 },
        },
        vehicle: {
            id: response.carSummary?.id ?? 0,
            brand: response.carSummary?.brand ?? 'Unknown',
            model: response.carSummary?.model ?? 'Unknown',
            licensePlate: response.carSummary?.licensePlate ?? '',
            imageUrl: response.carSummary?.imageUrl,
            status: 'Available' as CarStatus,
            fuelType: response.carSummary?.fuelType ?? '',
            transmissionType: response.carSummary?.transmissionType ?? '',
        },
        payment: {
            totalAmount: response.totalPrice,
            status: 'CAPTURED',
            method: 'card',
        },
        timeline: [
            { type: 'created' as const, timestamp: response.createTime ?? response.startDate },
        ],
        damages: [],
        notes: {
            approval: response.approvalNotes,
            pickup: response.pickupNotes,
            return: response.returnNotes,
            cancellation: response.cancellationReason,
        },
    };
}

async function fetchVehicleDetail(id: number): Promise<VehicleDetailResponse> {
    const response = await clientGet<{
        id: number;
        brand: string;
        model: string;
        productionYear: number;
        licensePlate: string;
        vinNumber?: string;
        carStatusType: string;
        fuelType: string;
        transmissionType: string;
        bodyType: string;
        seats: number;
        color: string;
        price: number;
        currencyType: string;
        imageUrl?: string;
        thumbnailUrl?: string;
    }>(`/api/cars/${id}`);

    return {
        id: response.id,
        brand: response.brand,
        model: response.model,
        year: response.productionYear,
        licensePlate: response.licensePlate,
        vin: response.vinNumber,
        status: response.carStatusType as CarStatus,
        fuelType: response.fuelType,
        transmissionType: response.transmissionType,
        bodyType: response.bodyType,
        seats: response.seats,
        color: response.color,
        pricing: {
            dailyRate: response.price,
            weeklyRate: response.price * 6,
            depositAmount: response.price * 3,
            currency: response.currencyType as CurrencyType,
        },
        images: {
            primary: response.imageUrl || '',
            additional: [],
        },
    };
}

async function fetchCustomerDetail(id: number): Promise<CustomerDetailResponse> {
    return clientGet<CustomerDetailResponse>(`/api/admin/users/${id}`);
}

async function fetchVehicleRentalHistory(id: number, page: number): Promise<PaginatedResponse<RentalHistoryItem>> {
    const data = await clientGet<PaginatedResponse<any>>(`/api/admin/cars/${id}/rentals?page=${page}&size=10`);
    return {
        ...data,
        content: data.content.map(rental => ({
            id: rental.id,
            customerId: rental.userSummary?.id,
            customerName: `${rental.userSummary?.firstName || ''} ${rental.userSummary?.lastName || ''}`.trim() || rental.userSummary?.username,
            carId: rental.carSummary?.id,
            vehicleName: `${rental.carSummary?.brand || ''} ${rental.carSummary?.model || ''}`.trim(),
            startDate: rental.startDate,
            endDate: rental.endDate,
            duration: rental.days,
            totalAmount: rental.totalPrice,
            status: rental.status as AdminRentalStatus,
        })),
    };
}

async function fetchCustomerRentalHistory(
    id: number,
    page: number,
    status?: AdminRentalStatus
): Promise<PaginatedResponse<RentalHistoryItem>> {
    const statusParam = status ? `&status=${status}` : '';
    const data = await clientGet<PaginatedResponse<any>>(`/api/admin/users/${id}/rentals?page=${page}&size=10${statusParam}`);
    return {
        ...data,
        content: data.content.map(rental => ({
            id: rental.id,
            customerId: rental.userSummary?.id,
            customerName: `${rental.userSummary?.firstName || ''} ${rental.userSummary?.lastName || ''}`.trim() || rental.userSummary?.username,
            carId: rental.carSummary?.id,
            vehicleName: `${rental.carSummary?.brand || ''} ${rental.carSummary?.model || ''}`.trim(),
            startDate: rental.startDate,
            endDate: rental.endDate,
            duration: rental.days,
            totalAmount: rental.totalPrice,
            status: rental.status as AdminRentalStatus,
        })),
    };
}

async function banCustomer({ userId, reason }: { userId: number; reason: string }): Promise<void> {
    return clientPost<void>(`/api/admin/users/${userId}/ban`, { reason });
}

async function unbanCustomer({ userId, note }: { userId: number; note?: string }): Promise<void> {
    return clientPost<void>(`/api/admin/users/${userId}/unban`, { note });
}

async function addAdminNote({ userId, text }: { userId: number; text: string }): Promise<AdminNote> {
    return clientPost<AdminNote>(`/api/admin/users/${userId}/notes`, { text });
}

export function useRentalDetail(id: number) {
    return useQuery({
        queryKey: adminKeys.rentalDetail(id),
        queryFn: () => fetchRentalDetail(id),
        staleTime: 30 * 1000,
        enabled: !!id,
    });
}

export function useVehicleDetail(id: number) {
    return useQuery({
        queryKey: adminKeys.vehicleDetail(id),
        queryFn: () => fetchVehicleDetail(id),
        staleTime: 30 * 1000,
        enabled: !!id,
    });
}

export function useCustomerDetail(id: number) {
    return useQuery({
        queryKey: adminKeys.customerDetail(id),
        queryFn: () => fetchCustomerDetail(id),
        staleTime: 30 * 1000,
        enabled: !!id,
    });
}

export function useVehicleRentalHistory(id: number, page: number = 0) {
    return useQuery({
        queryKey: adminKeys.vehicleRentalHistory(id, page),
        queryFn: () => fetchVehicleRentalHistory(id, page),
        staleTime: 30 * 1000,
        enabled: !!id,
    });
}

export function useCustomerRentalHistory(id: number, page: number = 0, status?: AdminRentalStatus) {
    return useQuery({
        queryKey: adminKeys.customerRentalHistory(id, page, status),
        queryFn: () => fetchCustomerRentalHistory(id, page, status),
        staleTime: 30 * 1000,
        enabled: !!id,
    });
}

export function useBanCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: banCustomer,
        onSuccess: (_, variables) => {
            showToast.success('Customer banned', 'The customer has been banned successfully.');
            void queryClient.invalidateQueries({ queryKey: adminKeys.customerDetail(variables.userId) });
            void queryClient.invalidateQueries({ queryKey: adminKeys.users() });
        },
        onError: (error: Error) => {
            showToast.error('Failed to ban customer', error.message);
        },
    });
}

export function useUnbanCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: unbanCustomer,
        onSuccess: (_, variables) => {
            showToast.success('Customer unbanned', 'The customer has been unbanned successfully.');
            void queryClient.invalidateQueries({ queryKey: adminKeys.customerDetail(variables.userId) });
            void queryClient.invalidateQueries({ queryKey: adminKeys.users() });
        },
        onError: (error: Error) => {
            showToast.error('Failed to unban customer', error.message);
        },
    });
}

export function useAddAdminNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addAdminNote,
        onSuccess: (_, variables) => {
            showToast.success('Note added', 'Admin note has been added successfully.');
            void queryClient.invalidateQueries({ queryKey: adminKeys.customerDetail(variables.userId) });
            void queryClient.invalidateQueries({ queryKey: adminKeys.customerNotes(variables.userId) });
        },
        onError: (error: Error) => {
            showToast.error('Failed to add note', error.message);
        },
    });
}
