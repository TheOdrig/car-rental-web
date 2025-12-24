import { create } from 'zustand';
import type { CarFilters } from '@/types';

export type ViewMode = 'grid' | 'list';
export type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'name-asc';

interface FilterState {
    filters: CarFilters;
    viewMode: ViewMode;
    sortBy: SortOption;
    setFilter: <K extends keyof CarFilters>(key: K, value: CarFilters[K]) => void;
    setFilters: (filters: Partial<CarFilters>) => void;
    clearFilters: () => void;
    hasActiveFilters: () => boolean;
    setViewMode: (mode: ViewMode) => void;
    setSortBy: (sort: SortOption) => void;
}

const initialFilters: CarFilters = {};

export const useFilterStore = create<FilterState>((set, get) => ({
    filters: initialFilters,
    viewMode: 'grid',
    sortBy: 'recommended',

    setFilter: (key, value) =>
        set((state) => ({
            filters: {
                ...state.filters,
                [key]: value === '' ? undefined : value,
            },
        })),

    setFilters: (newFilters) =>
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        })),

    clearFilters: () => set({ filters: initialFilters }),

    hasActiveFilters: () => {
        const { filters } = get();
        return Object.values(filters).some(
            (v) => v !== undefined && v !== null && v !== ''
        );
    },

    setViewMode: (mode) => set({ viewMode: mode }),

    setSortBy: (sort) => set({ sortBy: sort }),
}));
