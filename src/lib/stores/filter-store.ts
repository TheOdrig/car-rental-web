import { create } from 'zustand';
import type { CarFilters } from '@/types';

export type ViewMode = 'grid' | 'list';
export type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'name-asc' | 'rating-desc';

interface FilterState {
    filters: CarFilters;
    viewMode: ViewMode;
    sortBy: SortOption;
    page: number;
    setFilter: <K extends keyof CarFilters>(key: K, value: CarFilters[K]) => void;
    setFilters: (filters: Partial<CarFilters>) => void;
    clearFilters: () => void;
    hasActiveFilters: () => boolean;
    setViewMode: (mode: ViewMode) => void;
    setSortBy: (sort: SortOption) => void;
    setPage: (page: number) => void;
}

const initialFilters: CarFilters = {};

export const useFilterStore = create<FilterState>((set, get) => ({
    filters: initialFilters,
    viewMode: 'grid',
    sortBy: 'recommended',
    page: 0,

    setFilter: (key, value) =>
        set((state) => ({
            filters: {
                ...state.filters,
                [key]: value === '' ? undefined : value,
            },
            page: 0,
        })),

    setFilters: (newFilters) =>
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
            page: 0,
        })),

    clearFilters: () => set({ filters: initialFilters, page: 0 }),

    hasActiveFilters: () => {
        const { filters } = get();
        return Object.values(filters).some(
            (v) => v !== undefined && v !== null && v !== ''
        );
    },

    setViewMode: (mode) => set({ viewMode: mode }),

    setSortBy: (sort) => set({ sortBy: sort }),

    setPage: (page) => set({ page }),
}));
