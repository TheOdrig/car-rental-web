import { describe, it, expect } from 'vitest';
import { buildCarListParams, parseCarListParams } from '../list-url-state';

describe('car list url state', () => {
    it('reads filters, sort, page and view from the query string', () => {
        const state = parseCarListParams(
            new URLSearchParams('brand=Toyota&bodyType=SUV&minPrice=50&sort=price-asc&page=3&view=list')
        );

        expect(state.filters).toEqual({ brand: 'Toyota', bodyType: 'SUV', minPrice: 50 });
        expect(state.sortBy).toBe('price-asc');
        expect(state.page).toBe(2);
        expect(state.viewMode).toBe('list');
    });

    it('falls back to defaults for missing or invalid values', () => {
        const state = parseCarListParams(new URLSearchParams('sort=bogus&page=abc&minPrice=-4&maxPrice=x&view=other'));

        expect(state).toEqual({ filters: {}, sortBy: 'recommended', page: 0, viewMode: 'grid' });
    });

    it('writes only non-default values and keeps unrelated params', () => {
        const base = new URLSearchParams('startDate=2026-12-01&endDate=2026-12-05&page=9');
        const params = buildCarListParams(
            { filters: { brand: 'BMW', minSeats: 5 }, sortBy: 'recommended', page: 1, viewMode: 'grid' },
            base
        );

        expect(params.get('startDate')).toBe('2026-12-01');
        expect(params.get('endDate')).toBe('2026-12-05');
        expect(params.get('brand')).toBe('BMW');
        expect(params.get('minSeats')).toBe('5');
        expect(params.get('page')).toBe('2');
        expect(params.has('sort')).toBe(false);
        expect(params.has('view')).toBe(false);
    });

    it('round-trips a state through the query string', () => {
        const state = {
            filters: { fuelType: 'Electric', maxPrice: 200 },
            sortBy: 'name-asc' as const,
            page: 4,
            viewMode: 'list' as const,
        };

        expect(parseCarListParams(buildCarListParams(state))).toEqual(state);
    });
});
