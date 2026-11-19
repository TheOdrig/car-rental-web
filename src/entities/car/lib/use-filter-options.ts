'use client';

import { useQuery } from '@tanstack/react-query';
import { clientGet } from '@/shared/api';

interface FilterOptions {
    brands: string[];
    transmissionTypes: string[];
    fuelTypes: string[];
    bodyTypes: string[];
}

export const filterOptionsKeys = {
    all: ['filter-options'] as const,
};

export function uniqueOptions(values: readonly string[] | undefined): string[] {
    const byKey = new Map<string, string>();
    for (const value of values ?? []) {
        const trimmed = value?.trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        const existing = byKey.get(key);
        if (!existing || (existing === existing.toLowerCase() && trimmed !== trimmed.toLowerCase())) {
            byKey.set(key, trimmed);
        }
    }
    return [...byKey.values()].sort((a, b) => a.localeCompare(b, 'en-US'));
}

async function fetchFilterOptions(): Promise<FilterOptions> {
    const options = await clientGet<Partial<FilterOptions>>('/api/cars/filter-options');
    return {
        brands: uniqueOptions(options.brands),
        transmissionTypes: uniqueOptions(options.transmissionTypes),
        fuelTypes: uniqueOptions(options.fuelTypes),
        bodyTypes: uniqueOptions(options.bodyTypes),
    };
}

export function useFilterOptions() {
    return useQuery({
        queryKey: filterOptionsKeys.all,
        queryFn: fetchFilterOptions,
        staleTime: 30 * 60 * 1000,
        retry: 1,
    });
}

export type { FilterOptions };
