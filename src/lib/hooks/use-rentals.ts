'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost, clientDelete } from '@/lib/api/client';
import { showToast, toastMessages } from '@/lib/utils/toast';
import type { Rental, RentalRequest, PageResponse } from '@/types';

interface RentalFilters {
    page?: number;
    size?: number;
    status?: string;
    sort?: string;
}

export const rentalKeys = {
    all: ['rentals'] as const,
    lists: () => [...rentalKeys.all, 'list'] as const,
    list: (filters?: RentalFilters) => [...rentalKeys.lists(), filters] as const,
    myRentals: () => [...rentalKeys.all, 'my'] as const,
    myList: (filters?: RentalFilters) => [...rentalKeys.myRentals(), filters] as const,
    details: () => [...rentalKeys.all, 'detail'] as const,
    detail: (id: number) => [...rentalKeys.details(), id] as const,
};


async function fetchRentals(filters?: RentalFilters): Promise<PageResponse<Rental>> {
    const params = new URLSearchParams();

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });
    }

    const queryString = params.toString();
    const url = queryString ? `/api/rentals?${queryString}` : '/api/rentals';

    return clientGet<PageResponse<Rental>>(url);
}

async function fetchMyRentals(filters?: RentalFilters): Promise<PageResponse<Rental>> {
    const params = new URLSearchParams();

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });
    }

    const queryString = params.toString();
    const url = queryString ? `/api/rentals/me?${queryString}` : '/api/rentals/me';

    return clientGet<PageResponse<Rental>>(url);
}

async function fetchRental(id: number): Promise<Rental> {
    return clientGet<Rental>(`/api/rentals/${id}`);
}

async function createRental(data: RentalRequest): Promise<Rental> {
    return clientPost<Rental>('/api/rentals', data);
}

async function cancelRental(id: number): Promise<Rental> {
    return clientDelete<Rental>(`/api/rentals/${id}`);
}


export function useRentals(filters?: RentalFilters) {
    return useQuery({
        queryKey: rentalKeys.list(filters),
        queryFn: () => fetchRentals(filters),
        staleTime: 2 * 60 * 1000,
    });
}

export function useMyRentals(filters?: RentalFilters) {
    return useQuery({
        queryKey: rentalKeys.myList(filters),
        queryFn: () => fetchMyRentals(filters),
        staleTime: 2 * 60 * 1000,
    });
}

export function useRental(id: number | null | undefined) {
    return useQuery({
        queryKey: rentalKeys.detail(id!),
        queryFn: () => fetchRental(id!),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });
}

export function useCreateRental() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createRental,
        onSuccess: () => {
            showToast.success(toastMessages.rental.createSuccess);
            void queryClient.invalidateQueries({ queryKey: rentalKeys.all });
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.createError, error.message);
        },
    });
}

export function useCancelRental() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelRental,
        onSuccess: (_data, rentalId) => {
            showToast.success(toastMessages.rental.cancelSuccess);
            void queryClient.invalidateQueries({ queryKey: rentalKeys.all });
            void queryClient.invalidateQueries({ queryKey: rentalKeys.detail(rentalId) });
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.cancelError, error.message);
        },
    });
}

export function usePrefetchRental() {
    const queryClient = useQueryClient();

    return (id: number) => {
        void queryClient.prefetchQuery({
            queryKey: rentalKeys.detail(id),
            queryFn: () => fetchRental(id),
            staleTime: 2 * 60 * 1000,
        });
    };
}

export function useInvalidateRentals() {
    const queryClient = useQueryClient();

    return {
        all: () => queryClient.invalidateQueries({ queryKey: rentalKeys.all }),
        lists: () => queryClient.invalidateQueries({ queryKey: rentalKeys.lists() }),
        myRentals: () => queryClient.invalidateQueries({ queryKey: rentalKeys.myRentals() }),
        single: (id: number) => queryClient.invalidateQueries({ queryKey: rentalKeys.detail(id) }),
    };
}
