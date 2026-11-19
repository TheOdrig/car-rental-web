'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost, clientDelete, getApiErrorMessage } from '@/shared/api';
import { showToast } from '@/shared/lib';
import { toAdminRentalStatus } from '@/entities/rental';
import { carKeys, type Car, type VehicleDetailResponse } from '@/entities/car';
import type { PageResponse, CurrencyType } from '@/shared/types';
import { fleetKeys } from './fleet-keys';
import type { FleetFilters } from './fleet-keys';





export interface CreateCarRequest {
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
    currencyType: CurrencyType;
}

export interface UpdateCarRequest extends CreateCarRequest {
    id: number;
}

export interface CarResponse {
    id: number;
    brand: string;
    model: string;
    licensePlate: string;
}

export interface RentalHistoryItem {
    id: number;
    customerId?: number;
    customerName: string;
    carId?: number;
    vehicleName: string;
    startDate: string;
    endDate: string;
    duration: number;
    totalAmount: number;
    currency?: string;
    status: string;
}

export type PaginatedResponse<T> = PageResponse<T>;





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

async function fetchFleetCar(id: number): Promise<Car> {
    return clientGet<Car>(`/api/admin/cars/${id}`);
}

async function createCar(data: CreateCarRequest): Promise<CarResponse> {
    return clientPost<CarResponse>('/api/admin/cars', data);
}

async function updateCar({ id, ...data }: UpdateCarRequest): Promise<CarResponse> {
    return clientPost<CarResponse>(`/api/admin/cars/${id}`, data);
}

async function deleteCar(carId: number): Promise<void> {
    return clientDelete<void>(`/api/admin/cars/${carId}`);
}

async function restoreCar(carId: number): Promise<void> {
    return clientPost<void>(`/api/admin/cars/${carId}/restore`);
}

async function changeCarStatus(params: { id: number; status: string; reason?: string }): Promise<Car> {
    return clientPost<Car>(`/api/admin/cars/${params.id}/status`, {
        status: params.status,
        reason: params.reason
    });
}

async function fetchVehicleDetail(id: number): Promise<VehicleDetailResponse> {
    const response = await clientGet<Car>(`/api/admin/cars/${id}`);

    return {
        id: response.id,
        brand: response.brand,
        model: response.model,
        year: response.productionYear,
        licensePlate: response.licensePlate,
        vin: response.vinNumber,
        status: response.carStatusType,
        fuelType: response.fuelType ?? '',
        transmissionType: response.transmissionType ?? '',
        bodyType: response.bodyType ?? '',
        seats: response.seats ?? 0,
        color: response.color ?? '',
        pricing: {
            dailyRate: response.price,
            currency: response.currencyType,
        },
        images: {
            primary: response.imageUrl || '',
            additional: [],
        },
    };
}

interface ApiVehicleRentalHistoryItem {
    id: number;
    userSummary?: {
        id: number;
        firstName?: string;
        lastName?: string;
        username: string;
    };
    carSummary?: {
        id: number;
        brand: string;
        model: string;
    };
    startDate: string;
    endDate: string;
    days: number;
    totalPrice: number;
    currency?: string;
    status: string;
}

async function fetchVehicleRentalHistory(id: number, page: number): Promise<PaginatedResponse<RentalHistoryItem>> {
    const data = await clientGet<PaginatedResponse<ApiVehicleRentalHistoryItem>>(
        `/api/admin/cars/${id}/rentals?page=${page}&size=10`
    );

    return {
        ...data,
        content: data.content.map(rental => ({
            id: rental.id,
            customerId: rental.userSummary?.id,
            customerName: `${rental.userSummary?.firstName || ''} ${rental.userSummary?.lastName || ''}`.trim()
                || rental.userSummary?.username
                || 'Unknown',
            carId: rental.carSummary?.id,
            vehicleName: `${rental.carSummary?.brand || ''} ${rental.carSummary?.model || ''}`.trim()
                || 'Unknown Vehicle',
            startDate: rental.startDate,
            endDate: rental.endDate,
            duration: rental.days,
            totalAmount: rental.totalPrice,
            currency: rental.currency,
            status: toAdminRentalStatus(rental.status),
        })),
    };
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
        queryFn: () => fetchFleetCar(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateCar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCar,
        onSuccess: (result) => {
            showToast.success('Car added successfully', `${result.brand} ${result.model} has been added to your fleet.`);
            void queryClient.invalidateQueries({ queryKey: fleetKeys.all });
            void queryClient.invalidateQueries({ queryKey: carKeys.all });
        },
        onError: (error: Error) => {
            showToast.error('Failed to add car', getApiErrorMessage(error));
        },
    });
}

export function useUpdateCar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCar,
        onSuccess: (result) => {
            showToast.success('Car updated successfully', `${result.brand} ${result.model} has been updated.`);
            void queryClient.invalidateQueries({ queryKey: fleetKeys.all });
            void queryClient.invalidateQueries({ queryKey: carKeys.all });
        },
        onError: (error: Error) => {
            showToast.error('Failed to update car', getApiErrorMessage(error));
        },
    });
}

export function useRestoreCar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: restoreCar,
        onSuccess: () => {
            showToast.success('Car restored', 'The vehicle is back in the fleet.');
            void queryClient.invalidateQueries({ queryKey: fleetKeys.all });
            void queryClient.invalidateQueries({ queryKey: carKeys.all });
        },
        onError: (error: Error) => {
            showToast.error('Failed to restore car', getApiErrorMessage(error));
        },
    });
}

export function useDeleteCar() {
    const queryClient = useQueryClient();
    const restore = useRestoreCar();

    return useMutation({
        mutationFn: deleteCar,
        onSuccess: (_result, carId) => {
            showToast.success('Car removed from fleet', 'The vehicle was archived and can be restored.', {
                label: 'Undo',
                onClick: () => restore.mutate(carId),
            });
            void queryClient.invalidateQueries({ queryKey: fleetKeys.all });
            void queryClient.invalidateQueries({ queryKey: carKeys.all });
        },
        onError: (error: Error) => {
            showToast.error('Failed to remove car', getApiErrorMessage(error));
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
        },
        onError: (error: Error) => {
            showToast.error('Failed to change status', getApiErrorMessage(error));
        },
    });
}

export function useVehicleDetail(id: number) {
    return useQuery({
        queryKey: fleetKeys.vehicleDetail(id),
        queryFn: () => fetchVehicleDetail(id),
        staleTime: 30 * 1000,
        enabled: !!id,
    });
}

export function useVehicleRentalHistory(id: number, page: number = 0) {
    return useQuery({
        queryKey: fleetKeys.vehicleRentalHistory(id, page),
        queryFn: () => fetchVehicleRentalHistory(id, page),
        staleTime: 30 * 1000,
        enabled: !!id,
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