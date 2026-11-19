import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';
import { useFilterStore } from '@/widgets/car-filters';

let query = '';
const replace = vi.fn();
const push = vi.fn();
vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(query),
    usePathname: () => '/cars',
    useRouter: () => ({ replace, push }),
}));

const clientGet = vi.fn();
vi.mock('@/shared/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/api')>();
    return { ...original, clientGet: (...args: unknown[]) => clientGet(...args) };
});

import { CarsListingContent } from '../cars-listing-content';

function page(totalPages = 3) {
    return { content: [], totalElements: 30, totalPages, number: 0, size: 12 };
}

describe('cars listing url state', () => {
    beforeEach(() => {
        query = '';
        replace.mockClear();
        push.mockClear();
        clientGet.mockReset();
        clientGet.mockImplementation((url: string) =>
            Promise.resolve(url.includes('filter-options') ? { brands: [], transmissionTypes: [], fuelTypes: [], bodyTypes: [] } : page())
        );
        useFilterStore.setState({ filters: {}, sortBy: 'recommended', page: 0, viewMode: 'grid' });
    });

    it('applies the filters, sort and page from the address', async () => {
        query = 'brand=Toyota&sort=price-asc&page=2';

        renderWithProviders(<CarsListingContent />);

        await waitFor(() => expect(useFilterStore.getState().filters.brand).toBe('Toyota'));
        expect(useFilterStore.getState().sortBy).toBe('price-asc');
        expect(useFilterStore.getState().page).toBe(1);
        await waitFor(() =>
            expect(clientGet).toHaveBeenCalledWith(expect.stringContaining('brand=Toyota'))
        );
    });

    it('writes a changed filter and page back to the address', async () => {
        renderWithProviders(<CarsListingContent />);
        await screen.findByRole('heading', { name: 'Browse Cars' });

        act(() => {
            useFilterStore.getState().setFilter('brand', 'BMW');
        });
        await waitFor(() => expect(push).toHaveBeenCalledWith('/cars?brand=BMW', { scroll: false }));
        expect(replace).not.toHaveBeenCalled();

        act(() => {
            useFilterStore.getState().setPage(2);
        });
        await waitFor(() => expect(push).toHaveBeenLastCalledWith('/cars?brand=BMW&page=3', { scroll: false }));
    });

    it('keeps the search dates when the filters change', async () => {
        query = 'startDate=2026-12-01&endDate=2026-12-04';
        renderWithProviders(<CarsListingContent />);
        await screen.findByRole('heading', { name: 'Browse Cars' });

        act(() => {
            useFilterStore.getState().setFilter('fuelType', 'Electric');
        });

        await waitFor(() =>
            expect(push).toHaveBeenCalledWith(
                '/cars?startDate=2026-12-01&endDate=2026-12-04&fuelType=Electric',
                { scroll: false }
            )
        );
    });
});

describe('cars listing page beyond the last page', () => {
    it('clamps to the last page with a replace, so Back does not loop', async () => {
        query = 'page=99';
        clientGet.mockImplementation((url: string) =>
            Promise.resolve(url.includes('filter-options') ? { brands: [], transmissionTypes: [], fuelTypes: [], bodyTypes: [] } : page(3))
        );

        renderWithProviders(<CarsListingContent />);

        await waitFor(() => expect(replace).toHaveBeenCalledWith('/cars?page=3', { scroll: false }));
        expect(push).not.toHaveBeenCalled();
    });
});
