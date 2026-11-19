import type { CarFilters, SortOption, ViewMode } from '../model/types';

export interface CarListState {
    filters: CarFilters;
    sortBy: SortOption;
    page: number;
    viewMode: ViewMode;
}

const STRING_FILTERS = ['brand', 'model', 'fuelType', 'transmissionType', 'bodyType'] as const;
const NUMBER_FILTERS = ['minPrice', 'maxPrice', 'minSeats', 'minProductionYear', 'maxProductionYear'] as const;
const SORT_VALUES: readonly SortOption[] = ['recommended', 'price-asc', 'price-desc', 'name-asc'];
const MAX_PAGE = 10_000;

type ParamReader = Pick<URLSearchParams, 'get'>;

function readNumber(value: string | null): number | undefined {
    if (value === null || value.trim() === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function parseCarListParams(params: ParamReader): CarListState {
    const filters: CarFilters = {};

    for (const key of STRING_FILTERS) {
        const value = params.get(key);
        if (value && value.trim()) filters[key] = value.trim();
    }
    for (const key of NUMBER_FILTERS) {
        const value = readNumber(params.get(key));
        if (value !== undefined) filters[key] = value;
    }

    const sort = params.get('sort');
    const sortBy = SORT_VALUES.find((option) => option === sort) ?? 'recommended';

    const pageValue = readNumber(params.get('page'));
    const page = pageValue !== undefined && Number.isInteger(pageValue) ? Math.min(Math.max(pageValue - 1, 0), MAX_PAGE) : 0;

    const viewMode: ViewMode = params.get('view') === 'list' ? 'list' : 'grid';

    return { filters, sortBy, page, viewMode };
}

export function buildCarListParams(state: CarListState, base?: URLSearchParams): URLSearchParams {
    const params = new URLSearchParams();

    base?.forEach((value, key) => {
        const owned = (STRING_FILTERS as readonly string[]).includes(key)
            || (NUMBER_FILTERS as readonly string[]).includes(key)
            || key === 'sort'
            || key === 'page'
            || key === 'view';
        if (!owned) params.set(key, value);
    });

    for (const key of STRING_FILTERS) {
        const value = state.filters[key];
        if (value) params.set(key, value);
    }
    for (const key of NUMBER_FILTERS) {
        const value = state.filters[key];
        if (value !== undefined && value !== null) params.set(key, String(value));
    }

    if (state.sortBy !== 'recommended') params.set('sort', state.sortBy);
    if (state.page > 0) params.set('page', String(state.page + 1));
    if (state.viewMode === 'list') params.set('view', 'list');

    return params;
}
