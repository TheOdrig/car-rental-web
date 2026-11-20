'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost, isNotFoundError } from '@/shared/api';
import { showToast, toastMessages } from '@/shared/lib';
import { getRentalCancelErrorMessage, getRentalRequestErrorMessage } from './rental-errors';
import type { Rental, RentalRequest } from '@/entities/rental';
import type { PageResponse } from '@/shared/types';
import { STALE_TIME } from '@/shared/config/constants';

interface RentalFilters {
    page?: number;
    size?: number;
    status?: string;
    sort?: string;
}

export const rentalKeys = {
    all: ['rentals'] as const,
    myRentals: () => [...rentalKeys.all, 'my'] as const,
    myList: (filters?: RentalFilters) => [...rentalKeys.myRentals(), filters] as const,
    myAll: () => [...rentalKeys.myRentals(), 'all'] as const,
    details: () => [...rentalKeys.all, 'detail'] as const,
    detail: (id: number) => [...rentalKeys.details(), id] as const,
};

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

const ALL_RENTALS_PAGE_SIZE = 100;
const ALL_RENTALS_MAX_PAGES = 20;

async function fetchAllMyRentals(): Promise<Rental[]> {
    const rentals: Rental[] = [];
    for (let page = 0; page < ALL_RENTALS_MAX_PAGES; page += 1) {
        const result = await fetchMyRentals({ page, size: ALL_RENTALS_PAGE_SIZE });
        rentals.push(...result.content);
        if (page + 1 >= result.totalPages) break;
    }
    return rentals;
}

async function fetchRental(id: number): Promise<Rental> {
    return clientGet<Rental>(`/api/rentals/${id}`);
}

async function createRental(data: RentalRequest): Promise<Rental> {
    return clientPost<Rental>('/api/rentals', data);
}

export const CANCEL_REASON_MAX_LENGTH = 500;

export type CancelRentalInput = number | { rentalId: number; reason?: string };

function normalizeCancel(input: CancelRentalInput): { rentalId: number; reason?: string } {
    const { rentalId, reason } = typeof input === 'number' ? { rentalId: input, reason: undefined } : input;
    const trimmed = reason?.trim();
    return { rentalId, reason: trimmed ? trimmed : undefined };
}

async function cancelRental(input: CancelRentalInput): Promise<Rental> {
    const { rentalId, reason } = normalizeCancel(input);
    return clientPost<Rental>(`/api/rentals/${rentalId}/cancel`, reason ? { reason } : undefined);
}

export function useMyRentals(filters?: RentalFilters) {
    return useQuery({
        queryKey: rentalKeys.myList(filters),
        queryFn: () => fetchMyRentals(filters),
        staleTime: STALE_TIME.MEDIUM,
    });
}

export function useAllMyRentals() {
    return useQuery({
        queryKey: rentalKeys.myAll(),
        queryFn: fetchAllMyRentals,
        staleTime: STALE_TIME.MEDIUM,
    });
}

export function useRental(id: number | null | undefined) {
    return useQuery({
        queryKey: rentalKeys.detail(id!),
        queryFn: () => fetchRental(id!),
        enabled: !!id,
        staleTime: STALE_TIME.MEDIUM,
        retry: (failureCount, error) => !isNotFoundError(error) && failureCount < 1,
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
            showToast.error(toastMessages.rental.createError, getRentalRequestErrorMessage(error, error.message));
        },
    });
}

export function useCancelRental() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelRental,
        onSuccess: (_data, input) => {
            showToast.success(toastMessages.rental.cancelSuccess);
            void queryClient.invalidateQueries({ queryKey: rentalKeys.all });
            void queryClient.invalidateQueries({ queryKey: rentalKeys.detail(normalizeCancel(input).rentalId) });
        },
        onError: (error: Error) => {
            showToast.error(toastMessages.rental.cancelError, getRentalCancelErrorMessage(error));
        },
    });
}

export function usePrefetchRental() {
    const queryClient = useQueryClient();

    return (id: number) => {
        void queryClient.prefetchQuery({
            queryKey: rentalKeys.detail(id),
            queryFn: () => fetchRental(id),
            staleTime: STALE_TIME.MEDIUM,
        });
    };
}

export function useInvalidateRentals() {
    const queryClient = useQueryClient();

    return {
        all: () => queryClient.invalidateQueries({ queryKey: rentalKeys.all }),
        myRentals: () => queryClient.invalidateQueries({ queryKey: rentalKeys.myRentals() }),
        single: (id: number) => queryClient.invalidateQueries({ queryKey: rentalKeys.detail(id) }),
    };
}