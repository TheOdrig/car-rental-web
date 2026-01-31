import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/app/testing/test-utils';
import { useRentals, useMyRentals, useRental, useCreateRental, useCancelRental, rentalKeys } from '../use-rentals';
import { clientGet, clientPost, clientDelete } from '@/shared/api';
import { showToast } from '@/shared/lib';
import { createMockRental, createMockRentals } from '@/entities/rental/lib/testing/factories';
vi.mock('@/shared/api', () => ({
    clientGet: vi.fn(),
    clientPost: vi.fn(),
    clientDelete: vi.fn(),
}));
vi.mock('@/shared/lib', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/lib')>();
    return {
        ...original,
        showToast: {
            success: vi.fn(),
            error: vi.fn(),
        },
    };
});
const mockClientGet = vi.mocked(clientGet);
const mockClientPost = vi.mocked(clientPost);
const mockClientDelete = vi.mocked(clientDelete);
const mockToast = vi.mocked(showToast);
describe('use-rentals hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('rentalKeys', () => {
        it('should generate correct query keys', () => {
            expect(rentalKeys.all).toEqual(['rentals']);
            expect(rentalKeys.list({ status: 'CONFIRMED' })).toEqual(['rentals', 'list', { status: 'CONFIRMED' }]);
            expect(rentalKeys.myList()).toEqual(['rentals', 'my', undefined]);
        });
    });
    describe('useRentals', () => {
        it('should fetch rentals successfully', async () => {
            const mockRentals = createMockRentals(3);
            mockClientGet.mockResolvedValueOnce({ content: mockRentals, totalElements: 3 });
            const { result } = renderHook(() => useRentals(), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data?.content).toHaveLength(3);
            expect(mockClientGet).toHaveBeenCalledWith('/api/rentals');
        });
        it('should support filters', async () => {
            mockClientGet.mockResolvedValueOnce({ content: [] });
            renderHook(() => useRentals({ status: 'CONFIRMED', page: 1 }), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => {
                expect(mockClientGet).toHaveBeenCalledWith('/api/rentals?status=CONFIRMED&page=1');
            });
        });
    });
    describe('useMyRentals', () => {
        it('should fetch user rentals', async () => {
            mockClientGet.mockResolvedValueOnce({ content: [] });
            renderHook(() => useMyRentals({ size: 5 }), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => {
                expect(mockClientGet).toHaveBeenCalledWith('/api/rentals/me?size=5');
            });
        });
    });
    describe('useRental', () => {
        it('should fetch single rental', async () => {
            const mockRental = createMockRental({ id: 123 });
            mockClientGet.mockResolvedValueOnce(mockRental);
            const { result } = renderHook(() => useRental(123), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data).toEqual(mockRental);
            expect(mockClientGet).toHaveBeenCalledWith('/api/rentals/123');
        });
    });
    describe('useCreateRental', () => {
        it('should create rental successfully', async () => {
            const mockRental = createMockRental();
            mockClientPost.mockResolvedValueOnce(mockRental);
            const { result } = renderHook(() => useCreateRental(), {
                wrapper: createQueryWrapper(),
            });
            const request = { carId: 1, startDate: '2025-01-01', endDate: '2025-01-02' };
            await result.current.mutateAsync(request);
            expect(mockClientPost).toHaveBeenCalledWith('/api/rentals', request);
            expect(mockToast.success).toHaveBeenCalled();
        });
    });
    describe('useCancelRental', () => {
        it('should cancel rental and show toast', async () => {
            mockClientDelete.mockResolvedValueOnce({});
            const { result } = renderHook(() => useCancelRental(), {
                wrapper: createQueryWrapper(),
            });
            await result.current.mutateAsync(1);
            expect(mockClientDelete).toHaveBeenCalledWith('/api/rentals/1');
            expect(mockToast.success).toHaveBeenCalled();
        });
        it('should handle cancel error', async () => {
            mockClientDelete.mockRejectedValue(new Error('Cancel failed'));
            const { result } = renderHook(() => useCancelRental(), {
                wrapper: createQueryWrapper(),
            });
            await result.current.mutate(1);
            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(mockToast.error).toHaveBeenCalledWith(expect.any(String), 'Cancel failed');
        });
    });
});