import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/app/testing/test-utils';
import { uniqueOptions, useFilterOptions } from '../use-filter-options';

const clientGet = vi.fn();
vi.mock('@/shared/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/api')>();
    return { ...original, clientGet: (...args: unknown[]) => clientGet(...args) };
});

describe('uniqueOptions', () => {
    it('merges case variants and keeps the capitalised spelling', () => {
        expect(uniqueOptions(['manual', 'Manual', 'Automatic', 'suv', 'SUV'])).toEqual(['Automatic', 'Manual', 'SUV']);
    });

    it('drops blanks and sorts', () => {
        expect(uniqueOptions(['', '  ', 'b', 'a'])).toEqual(['a', 'b']);
        expect(uniqueOptions(undefined)).toEqual([]);
    });
});

describe('useFilterOptions', () => {
    beforeEach(() => clientGet.mockReset());

    it('offers only what the API returns, with no hard-coded placeholders', async () => {
        clientGet.mockResolvedValue({
            brands: ['Fiat'],
            transmissionTypes: ['Manual', 'manual'],
            fuelTypes: ['Diesel'],
            bodyTypes: ['SUV', 'Sedan', 'Hatchback'],
        });
        const { result } = renderHook(() => useFilterOptions(), { wrapper: createQueryWrapper() });

        expect(result.current.data).toBeUndefined();
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.bodyTypes).toEqual(['Hatchback', 'Sedan', 'SUV']);
        expect(result.current.data?.transmissionTypes).toEqual(['Manual']);
        expect(clientGet).toHaveBeenCalledWith('/api/cars/filter-options');
    });
});
