import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from '@/lib/stores/filter-store';

describe('useFilterStore', () => {
    beforeEach(() => {
        useFilterStore.getState().clearFilters();
    });

    describe('initial state', () => {
        it('should have empty filters by default', () => {
            const { filters } = useFilterStore.getState();

            expect(filters).toEqual({});
            expect(filters.brand).toBeUndefined();
            expect(filters.bodyType).toBeUndefined();
            expect(filters.fuelType).toBeUndefined();
            expect(filters.transmissionType).toBeUndefined();
            expect(filters.minPrice).toBeUndefined();
            expect(filters.maxPrice).toBeUndefined();
            expect(filters.minSeats).toBeUndefined();
        });

        it('should report no active filters initially', () => {
            const { hasActiveFilters } = useFilterStore.getState();

            expect(hasActiveFilters()).toBe(false);
        });
    });

    describe('setFilter', () => {
        it('should set a single filter value', () => {
            const { setFilter } = useFilterStore.getState();

            setFilter('brand', 'Toyota');

            expect(useFilterStore.getState().filters.brand).toBe('Toyota');
        });

        it('should update existing filter value', () => {
            const { setFilter } = useFilterStore.getState();

            setFilter('brand', 'Toyota');
            setFilter('brand', 'Honda');

            expect(useFilterStore.getState().filters.brand).toBe('Honda');
        });

        it('should set bodyType filter', () => {
            const { setFilter } = useFilterStore.getState();

            setFilter('bodyType', 'SUV');

            expect(useFilterStore.getState().filters.bodyType).toBe('SUV');
        });

        it('should set transmissionType filter', () => {
            const { setFilter } = useFilterStore.getState();

            setFilter('transmissionType', 'Automatic');

            expect(useFilterStore.getState().filters.transmissionType).toBe('Automatic');
        });

        it('should set fuelType filter', () => {
            const { setFilter } = useFilterStore.getState();

            setFilter('fuelType', 'Electric');

            expect(useFilterStore.getState().filters.fuelType).toBe('Electric');
        });

        it('should set minSeats filter', () => {
            const { setFilter } = useFilterStore.getState();

            setFilter('minSeats', 4);

            expect(useFilterStore.getState().filters.minSeats).toBe(4);
        });

        it('should convert empty string to undefined', () => {
            const { setFilter } = useFilterStore.getState();

            setFilter('brand', 'Toyota');
            setFilter('brand', '');

            expect(useFilterStore.getState().filters.brand).toBeUndefined();
        });

        it('should remove filter when set to undefined', () => {
            const { setFilter } = useFilterStore.getState();

            setFilter('brand', 'Toyota');
            setFilter('brand', undefined);

            expect(useFilterStore.getState().filters.brand).toBeUndefined();
        });
    });

    describe('setFilters', () => {
        it('should set multiple filters at once', () => {
            const { setFilters } = useFilterStore.getState();

            setFilters({
                minPrice: 50,
                maxPrice: 200,
            });

            const { filters } = useFilterStore.getState();
            expect(filters.minPrice).toBe(50);
            expect(filters.maxPrice).toBe(200);
        });

        it('should merge with existing filters', () => {
            const { setFilter, setFilters } = useFilterStore.getState();

            setFilter('brand', 'Toyota');
            setFilters({ bodyType: 'SUV', minSeats: 5 });

            const { filters } = useFilterStore.getState();
            expect(filters.brand).toBe('Toyota');
            expect(filters.bodyType).toBe('SUV');
            expect(filters.minSeats).toBe(5);
        });

        it('should override existing values for same keys', () => {
            const { setFilter, setFilters } = useFilterStore.getState();

            setFilter('minPrice', 100);
            setFilters({ minPrice: 150 });

            expect(useFilterStore.getState().filters.minPrice).toBe(150);
        });
    });

    describe('clearFilters', () => {
        it('should clear all filters', () => {
            const { setFilter, setFilters, clearFilters } = useFilterStore.getState();

            setFilter('brand', 'Toyota');
            setFilter('bodyType', 'SUV');
            setFilters({ minPrice: 50, maxPrice: 200, minSeats: 4 });

            clearFilters();

            const { filters } = useFilterStore.getState();
            expect(filters).toEqual({});
            expect(filters.brand).toBeUndefined();
            expect(filters.bodyType).toBeUndefined();
            expect(filters.minPrice).toBeUndefined();
            expect(filters.maxPrice).toBeUndefined();
            expect(filters.minSeats).toBeUndefined();
        });

        it('should set hasActiveFilters to false after clearing', () => {
            const { setFilter, clearFilters, hasActiveFilters } = useFilterStore.getState();

            setFilter('brand', 'Toyota');
            expect(hasActiveFilters()).toBe(true);

            clearFilters();
            expect(useFilterStore.getState().hasActiveFilters()).toBe(false);
        });
    });

    describe('hasActiveFilters', () => {
        it('should return true when at least one filter is set', () => {
            const { setFilter, hasActiveFilters } = useFilterStore.getState();

            setFilter('brand', 'Toyota');

            expect(hasActiveFilters()).toBe(true);
        });

        it('should return true when multiple filters are set', () => {
            const { setFilters, hasActiveFilters } = useFilterStore.getState();

            setFilters({
                brand: 'Toyota',
                bodyType: 'SUV',
                minPrice: 50,
            });

            expect(hasActiveFilters()).toBe(true);
        });

        it('should return false when all filters are undefined', () => {
            const { hasActiveFilters } = useFilterStore.getState();

            expect(hasActiveFilters()).toBe(false);
        });

        it('should return false when filters are null', () => {
            const { setFilter, hasActiveFilters } = useFilterStore.getState();

            setFilter('brand', null as unknown as string);

            expect(hasActiveFilters()).toBe(false);
        });

        it('should return false when filters are empty strings', () => {
            const { setFilter, hasActiveFilters } = useFilterStore.getState();

            setFilter('brand', '');

            expect(hasActiveFilters()).toBe(false);
        });

        it('should return true for numeric zero values', () => {
            const { setFilter, hasActiveFilters } = useFilterStore.getState();

            setFilter('minPrice', 0);

            expect(hasActiveFilters()).toBe(true);
        });
    });

    describe('filter combinations', () => {
        it('should handle typical filter scenario', () => {
            const { setFilter, setFilters, hasActiveFilters } = useFilterStore.getState();

            setFilter('bodyType', 'SUV');
            expect(hasActiveFilters()).toBe(true);

            setFilter('transmissionType', 'Automatic');

            setFilters({ minPrice: 50, maxPrice: 200 });

            setFilter('minSeats', 5);

            const { filters } = useFilterStore.getState();
            expect(filters.bodyType).toBe('SUV');
            expect(filters.transmissionType).toBe('Automatic');
            expect(filters.minPrice).toBe(50);
            expect(filters.maxPrice).toBe(200);
            expect(filters.minSeats).toBe(5);
        });

        it('should handle toggling filter on and off', () => {
            const { setFilter, hasActiveFilters } = useFilterStore.getState();

            setFilter('transmissionType', 'Automatic');
            expect(useFilterStore.getState().filters.transmissionType).toBe('Automatic');
            expect(hasActiveFilters()).toBe(true);

            setFilter('transmissionType', undefined);
            expect(useFilterStore.getState().filters.transmissionType).toBeUndefined();
            expect(useFilterStore.getState().hasActiveFilters()).toBe(false);
        });
    });

    describe('viewMode', () => {
        it('should default to grid view', () => {
            const { viewMode } = useFilterStore.getState();
            expect(viewMode).toBe('grid');
        });

        it('should set view mode to list', () => {
            const { setViewMode } = useFilterStore.getState();

            setViewMode('list');

            expect(useFilterStore.getState().viewMode).toBe('list');
        });

        it('should set view mode back to grid', () => {
            const { setViewMode } = useFilterStore.getState();

            setViewMode('list');
            setViewMode('grid');

            expect(useFilterStore.getState().viewMode).toBe('grid');
        });

        it('should not be affected by clearFilters', () => {
            const { setViewMode, clearFilters } = useFilterStore.getState();

            setViewMode('list');
            clearFilters();

            expect(useFilterStore.getState().viewMode).toBe('list');
        });
    });

    describe('sortBy', () => {
        it('should default to recommended', () => {
            const { sortBy } = useFilterStore.getState();
            expect(sortBy).toBe('recommended');
        });

        it('should set sort option', () => {
            const { setSortBy } = useFilterStore.getState();

            setSortBy('price-asc');

            expect(useFilterStore.getState().sortBy).toBe('price-asc');
        });

        it('should allow all sort options', () => {
            const { setSortBy } = useFilterStore.getState();

            setSortBy('price-desc');
            expect(useFilterStore.getState().sortBy).toBe('price-desc');

            setSortBy('name-asc');
            expect(useFilterStore.getState().sortBy).toBe('name-asc');

            setSortBy('recommended');
            expect(useFilterStore.getState().sortBy).toBe('recommended');
        });

        it('should not be affected by clearFilters', () => {
            const { setSortBy, clearFilters } = useFilterStore.getState();

            setSortBy('price-asc');
            clearFilters();

            expect(useFilterStore.getState().sortBy).toBe('price-asc');
        });
    });
});

