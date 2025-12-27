'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost } from '@/lib/api/client';
import { useFilterStore, type SortOption } from '@/lib/stores/filter-store';
import type {
    Car,
    CarFilters,
    PageResponse,
    CarAvailabilityCalendar,
    SimilarCar,
    AvailabilitySearchRequest,
    AvailabilitySearchResponse,
} from '@/types';


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


function sortOptionToParam(sortBy: SortOption): string {
    switch (sortBy) {
        case 'price-asc': return 'price,asc';
        case 'price-desc': return 'price,desc';
        case 'name-asc': return 'brand,asc';
        case 'rating-desc': return 'rating,desc';
        case 'recommended':
        default: return 'createTime,desc';
    }
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
    params.append('sort', sortOptionToParam(sortBy));

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


export function useCars(filters?: CarFilters, page: number = 0) {
    const { sortBy } = useFilterStore();

    return useQuery({
        queryKey: [...carKeys.list(filters), page, sortBy],
        queryFn: () => fetchCars(filters, page, sortBy),
        staleTime: 5 * 60 * 1000,
    });
}

export function useFeaturedCars() {
    return useQuery({
        queryKey: carKeys.featured(),
        queryFn: () => clientGet<PageResponse<Car>>('/api/cars/featured'),
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

export function useCarCalendar(id: number | null | undefined, month?: string) {
    return useQuery({
        queryKey: carKeys.calendar(id!, month),
        queryFn: async () => {
            const response = await fetchCar(id!, {
                includeCalendar: true,
                calendarMonth: month,
            });
            return response.calendar;
        },
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });
}


export function useSimilarCars(id: number | null | undefined) {
    return useQuery({
        queryKey: carKeys.similar(id!),
        queryFn: async () => {
            const response = await fetchCar(id!, { includeSimilar: true });
            return response.similarCars ?? [];
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
