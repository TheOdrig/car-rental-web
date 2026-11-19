import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/app/testing/test-utils';
import { useMyRentals, useAllMyRentals, useRental, useCreateRental, useCancelRental, rentalKeys } from '../use-rentals';
import { ApiError, clientGet, clientPost, clientDelete } from '@/shared/api';
import { showToast } from '@/shared/lib';
import { createMockRental, createMockRentals } from '@/entities/rental/lib/testing/factories';
vi.mock('@/shared/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/api')>();
    return {
        ...original,
        clientGet: vi.fn(),
        clientPost: vi.fn(),
        clientDelete: vi.fn(),
    };
});
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
            expect(rentalKeys.myAll()).toEqual(['rentals', 'my', 'all']);
            expect(rentalKeys.myList()).toEqual(['rentals', 'my', undefined]);
        });
    });
    describe('useAllMyRentals', () => {
        it('collects every page so stats and tabs cover all rentals', async () => {
            mockClientGet
                .mockResolvedValueOnce({ content: createMockRentals(2), totalElements: 3, totalPages: 2, page: 0 })
                .mockResolvedValueOnce({ content: createMockRentals(1), totalElements: 3, totalPages: 2, page: 1 });
            const { result } = renderHook(() => useAllMyRentals(), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data).toHaveLength(3);
            expect(mockClientGet).toHaveBeenNthCalledWith(1, '/api/rentals/me?page=0&size=100');
            expect(mockClientGet).toHaveBeenNthCalledWith(2, '/api/rentals/me?page=1&size=100');
        });
        it('stops after a single page', async () => {
            mockClientGet.mockResolvedValueOnce({ content: createMockRentals(2), totalElements: 2, totalPages: 1, page: 0 });
            const { result } = renderHook(() => useAllMyRentals(), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(mockClientGet).toHaveBeenCalledTimes(1);
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
        it('should explain the open request cap in the error toast', async () => {
            mockClientPost.mockRejectedValueOnce(
                new ApiError({
                    status: 409,
                    message: 'You already have 3 open rental requests.',
                    timestamp: new Date().toISOString(),
                    code: 'OPEN_RENTAL_REQUEST_LIMIT_EXCEEDED',
                })
            );
            const { result } = renderHook(() => useCreateRental(), {
                wrapper: createQueryWrapper(),
            });
            result.current.mutate({ carId: 1, startDate: '2026-12-01', endDate: '2026-12-03' });
            await waitFor(() => expect(mockToast.error).toHaveBeenCalled());
            expect(mockToast.error.mock.calls[0][1]).toContain('3 open rental requests');
        });
        it('should show the retry hint when rate limited', async () => {
            mockClientPost.mockRejectedValueOnce(
                new ApiError({
                    status: 429,
                    message: 'Too many requests',
                    timestamp: new Date().toISOString(),
                    code: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: 30,
                })
            );
            const { result } = renderHook(() => useCreateRental(), {
                wrapper: createQueryWrapper(),
            });
            result.current.mutate({ carId: 1, startDate: '2026-12-01', endDate: '2026-12-03' });
            await waitFor(() => expect(mockToast.error).toHaveBeenCalled());
            expect(mockToast.error.mock.calls[0][1]).toContain('30 seconds');
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
        it('explains a cancel the API no longer allows', async () => {
            mockClientDelete.mockRejectedValue(
                new ApiError({ status: 400, message: 'nope', timestamp: new Date().toISOString(), code: 'RENTAL_CANCEL_NOT_ALLOWED' })
            );
            const { result } = renderHook(() => useCancelRental(), {
                wrapper: createQueryWrapper(),
            });
            result.current.mutate(1);
            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(mockToast.error).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('can no longer be cancelled'));
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