
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/app/testing/test-utils';
import { createMockCar, createMockCars, resetCarCounters } from '@/entities/car/lib/testing/factories';
import { useFleetList, useFleetCar, useDeleteCar, useChangeCarStatus, useInvalidateFleet, fleetKeys } from '../use-fleet';
import { clientGet, clientPost, clientDelete } from '@/shared/api';
import { showToast } from '@/shared/lib';
import type { PageResponse } from '@/shared/types';
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
function createMockPageResponse<T>(content: T[]): PageResponse<T> {
    return {
        content,
        pageable: { pageNumber: 0, pageSize: 10, offset: 0, paged: true, unpaged: false },
        totalPages: 1,
        totalElements: content.length,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: content.length === 0,
    };
}
describe('use-fleet hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetCarCounters();
    });
    describe('fleetKeys', () => {
        it('should generate correct query keys', () => {
            expect(fleetKeys.all).toEqual(['fleet']);
            expect(fleetKeys.list({ status: 'AVAILABLE' })).toEqual(['fleet', 'list', { status: 'AVAILABLE' }]);
            expect(fleetKeys.detail(1)).toEqual(['fleet', 'detail', 1]);
        });
    });
    describe('useFleetList', () => {
        it('should fetch fleet list successfully', async () => {
            const mockCars = createMockCars(3);
            const mockResponse = createMockPageResponse(mockCars);
            mockClientGet.mockResolvedValueOnce(mockResponse);
            const { result } = renderHook(() => useFleetList(), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
            expect(result.current.data).toEqual(mockResponse);
            expect(mockClientGet).toHaveBeenCalledWith('/api/admin/cars');
        });
        it('should fetch fleet list with filters', async () => {
            const mockResponse = createMockPageResponse([]);
            mockClientGet.mockResolvedValueOnce(mockResponse);
            renderHook(() => useFleetList({ status: 'AVAILABLE', brand: 'Toyota', search: 'test', page: 1, size: 20 }), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => {
                expect(mockClientGet).toHaveBeenCalledWith('/api/admin/cars?status=AVAILABLE&brand=Toyota&search=test&page=1&size=20');
            });
        });
    });
    describe('useFleetCar', () => {
        it('should fetch single car successfully', async () => {
            const mockCar = createMockCar({ id: 1 });
            mockClientGet.mockResolvedValueOnce(mockCar);
            const { result } = renderHook(() => useFleetCar(1), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
            expect(result.current.data).toEqual(mockCar);
            expect(mockClientGet).toHaveBeenCalledWith('/api/admin/cars/1');
        });
        it('should not fetch when id is missing', () => {
            const { result } = renderHook(() => useFleetCar(null), {
                wrapper: createQueryWrapper(),
            });
            expect(result.current.fetchStatus).toBe('idle');
            expect(mockClientGet).not.toHaveBeenCalled();
        });
    });
    describe('useDeleteCar', () => {
        it('should delete car successfully', async () => {
            mockClientDelete.mockResolvedValueOnce(undefined);
            const { result } = renderHook(() => useDeleteCar(), {
                wrapper: createQueryWrapper(),
            });
            await result.current.mutateAsync(1);
            expect(mockClientDelete).toHaveBeenCalledWith('/api/admin/cars/1');
            expect(mockToast.success).toHaveBeenCalledWith('Car deleted', expect.any(String));
        });
        it('should handle delete error', async () => {
            const error = new Error('Delete failed');
            mockClientDelete.mockRejectedValue(error);
            const { result } = renderHook(() => useDeleteCar(), {
                wrapper: createQueryWrapper(),
            });
            await result.current.mutate(1);
            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });
            expect(mockToast.error).toHaveBeenCalledWith('Failed to delete car', 'Delete failed');
        });
    });
    describe('useChangeCarStatus', () => {
        it('should change car status successfully', async () => {
            const mockCar = createMockCar({ id: 1, brand: 'Toyota', model: 'Corolla' });
            mockClientPost.mockResolvedValueOnce(mockCar);
            const { result } = renderHook(() => useChangeCarStatus(), {
                wrapper: createQueryWrapper(),
            });
            await result.current.mutateAsync({ id: 1, status: 'MAINTENANCE' });
            expect(mockClientPost).toHaveBeenCalledWith('/api/admin/cars/1/status', { status: 'MAINTENANCE' });
            expect(mockToast.success).toHaveBeenCalledWith('Status updated', expect.stringContaining('Toyota Corolla'));
        });
        it('should handle status change error', async () => {
            const error = new Error('Update failed');
            mockClientPost.mockRejectedValue(error);
            const { result } = renderHook(() => useChangeCarStatus(), {
                wrapper: createQueryWrapper(),
            });
            await result.current.mutate({ id: 1, status: 'MAINTENANCE' });
            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });
            expect(mockToast.error).toHaveBeenCalledWith('Failed to change status', 'Update failed');
        });
    });
    describe('useInvalidateFleet', () => {
        it('should return invalidation functions', () => {
            const { result } = renderHook(() => useInvalidateFleet(), {
                wrapper: createQueryWrapper(),
            });
            expect(typeof result.current.all).toBe('function');
            expect(typeof result.current.list).toBe('function');
            expect(typeof result.current.single).toBe('function');
        });
    });
});