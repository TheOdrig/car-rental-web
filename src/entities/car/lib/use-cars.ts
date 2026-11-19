'use client';

import { useMemo } from 'react';
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost } from '@/shared/api';
import { getSortParams } from './utils';
import type { Car, CarFilters, CarAvailabilityCalendar, SimilarCar, AvailabilitySearchRequest, AvailabilitySearchResponse, SortOption } from '@/entities/car';
import type { PageResponse } from '@/shared/types';

const FEATURED_PAGE_SIZE = 8;

export const carKeys = {
    all: ['cars'] as const,
    lists: () => [...carKeys.all, 'list'] as const,
    list: (filters?: CarFilters) => [...carKeys.lists(), filters] as const,
    featured: () => [...carKeys.all, 'featured'] as const,
    details: () => [...carKeys.all, 'detail'] as const,
    detail: (id: number) => [...carKeys.details(), id] as const,
    search: () => [...carKeys.all, 'search'] as const,
    searchResult: (params: AvailabilitySearchRequest) => [...carKeys.search(), params] as const,
    calendar: (id: number, month?: string) => [...carKeys.detail(id), 'calendar', month] as const,
    similar: (id: number) => [...carKeys.detail(id), 'similar'] as const,
};

interface CarDetailResponse {
    car: Car;
    calendar?: CarAvailabilityCalendar;
    similarCars?: SimilarCar[];
}

interface UseCarOptions {
    includeCalendar?: boolean;
    includeSimilar?: boolean;
    calendarMonth?: string;
}

async function fetchCars(
    filters?: CarFilters,
    page: number = 0,
    sortBy: SortOption = 'recommended'
): Promise<PageResponse<Car>> {
    const params = new URLSearchParams();

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });
    }

    params.append('page', String(page));
    params.append('size', '12');
    const [sortField, sortDirection] = getSortParams(sortBy);
    params.append('sortBy', sortField);
    params.append('sortDirection', sortDirection);

    const queryString = params.toString();
    const url = `/api/cars?${queryString}`;

    return clientGet<PageResponse<Car>>(url);
}

async function fetchCar(id: number, options?: UseCarOptions): Promise<CarDetailResponse> {
    const params = new URLSearchParams();
    const includes: string[] = [];

    if (options?.includeCalendar) includes.push('calendar');
    if (options?.includeSimilar) includes.push('similar');

    if (includes.length > 0) {
        params.append('include', includes.join(','));
    }
    if (options?.calendarMonth) {
        params.append('month', options.calendarMonth);
    }

    const queryString = params.toString();
    const url = queryString ? `/api/cars/${id}?${queryString}` : `/api/cars/${id}`;

    return clientGet<CarDetailResponse>(url);
}

async function searchCars(params: AvailabilitySearchRequest): Promise<AvailabilitySearchResponse> {
    return clientPost<AvailabilitySearchResponse>('/api/cars/search', params);
}

export function useCars(filters?: CarFilters, page: number = 0, sortBy: SortOption = 'recommended') {
    return useQuery({
        queryKey: [...carKeys.list(filters), page, sortBy],
        queryFn: () => fetchCars(filters, page, sortBy),
        staleTime: 5 * 60 * 1000,
    });
}

export function useFeaturedCars() {
    return useQuery({
        queryKey: carKeys.featured(),
        queryFn: () => clientGet<PageResponse<Car>>(`/api/cars?carStatusType=AVAILABLE&sortBy=createTime&sortDirection=desc&page=0&size=${FEATURED_PAGE_SIZE}`),
        staleTime: 5 * 60 * 1000,
    });
}

export function useCar(id: number | null | undefined, options?: UseCarOptions) {
    return useQuery({
        queryKey: carKeys.detail(id!),
        queryFn: () => fetchCar(id!, options),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

async function fetchCarCalendar(id: number, month?: string): Promise<CarAvailabilityCalendar | null> {
    try {
        const params = new URLSearchParams();
        if (month) params.append('month', month);

        const queryString = params.toString();
        const url = queryString
            ? `/api/cars/${id}/availability/calendar?${queryString}`
            : `/api/cars/${id}/availability/calendar`;

        const data = await clientGet<CarAvailabilityCalendar>(url);
        return data ?? null;
    } catch (error) {
        console.error('Error fetching car calendar:', error);
        return null;
    }
}

export function useCarCalendar(id: number | null | undefined, month?: string) {
    return useQuery({
        queryKey: carKeys.calendar(id!, month),
        queryFn: () => fetchCarCalendar(id!, month),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });
}

export function useBookedDates(id: number | null | undefined, months: readonly string[]) {
    const results = useQueries({
        queries: months.map((month) => ({
            queryKey: carKeys.calendar(id!, month),
            queryFn: () => fetchCarCalendar(id!, month),
            enabled: !!id,
            staleTime: 2 * 60 * 1000,
        })),
    });

    return useMemo(() => {
        const booked = new Set<string>();
        let blocked: string | null = null;
        for (const result of results) {
            const calendar = result.data;
            if (!calendar) continue;
            if (calendar.carBlocked) blocked = calendar.blockReason ?? 'This car is currently unavailable';
            for (const day of calendar.days) {
                if (day.status !== 'Available') booked.add(day.date);
            }
        }
        return { booked, blockedReason: blocked };
    }, [results]);
}

export function useSimilarCars(id: number | null | undefined) {
    return useQuery({
        queryKey: carKeys.similar(id!),
        queryFn: async () => {
            const url = `/api/cars/${id}/similar`;
            const data = await clientGet<SimilarCar[]>(url);
            return data || [];
        },
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
}

export function useCarSearch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: searchCars,
        onSuccess: (data, variables) => {
            queryClient.setQueryData(carKeys.searchResult(variables), data);
        },
    });
}

export function useCarSearchResults(params: AvailabilitySearchRequest | null) {
    return useQuery({
        queryKey: carKeys.searchResult(params!),
        queryFn: () => searchCars(params!),
        enabled: !!params && !!params.startDate && !!params.endDate,
        staleTime: 2 * 60 * 1000,
    });
}

export function usePrefetchCar() {
    const queryClient = useQueryClient();

    return (id: number) => {
        void queryClient.prefetchQuery({
            queryKey: carKeys.detail(id),
            queryFn: () => fetchCar(id),
            staleTime: 5 * 60 * 1000,
        });
    };
}

export function useInvalidateCars() {
    const queryClient = useQueryClient();

    return {
        all: () => queryClient.invalidateQueries({ queryKey: carKeys.all }),
        lists: () => queryClient.invalidateQueries({ queryKey: carKeys.lists() }),
        single: (id: number) => queryClient.invalidateQueries({ queryKey: carKeys.detail(id) }),
        search: () => queryClient.invalidateQueries({ queryKey: carKeys.search() }),
    };
}