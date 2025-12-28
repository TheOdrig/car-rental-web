'use client';

import { useQuery } from '@tanstack/react-query';
import { clientGet } from '@/lib/api/client';

interface FilterOptions {
    brands: string[];
    transmissions: string[];
    fuelTypes: string[];
    bodyTypes: string[];
}

const FALLBACK_OPTIONS: FilterOptions = {
    brands: ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Ford', 'Volkswagen'],
    transmissions: ['Automatic', 'Manual'],
    fuelTypes: ['Gasoline', 'Diesel', 'Electric', 'Hybrid'],
    bodyTypes: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Van'],
};

export const filterOptionsKeys = {
    all: ['filter-options'] as const,
};

async function fetchFilterOptions(): Promise<FilterOptions> {
    return clientGet<FilterOptions>('/api/cars/filter-options');
}

export function useFilterOptions() {
    return useQuery({
        queryKey: filterOptionsKeys.all,
        queryFn: fetchFilterOptions,
        staleTime: 30 * 60 * 1000,
        placeholderData: FALLBACK_OPTIONS,
        retry: 1,
    });
}

export type { FilterOptions };
