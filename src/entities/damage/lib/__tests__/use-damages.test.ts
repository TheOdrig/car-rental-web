import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/app/testing/test-utils';
import { useDamages, useDamageDetail, useCreateDamage, useAssessDamage, useDisputeDamage, useResolveDamage, damageKeys } from '../use-damages';
import { clientGet, clientPost } from '@/shared/api';
import { showToast } from '@/shared/lib';
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
const mockToast = vi.mocked(showToast);
import { createMockDamage, createMockDamageListResponse } from '../testing/factories';

describe('use-damages hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('damageKeys', () => {
        it('should generate correct query keys', () => {
            expect(damageKeys.all).toEqual(['damages']);
            expect(damageKeys.list({ severity: 'MINOR' })).toEqual(['damages', 'list', { severity: 'MINOR' }]);
            expect(damageKeys.detail(1)).toEqual(['damages', 'detail', 1]);
        });
    });
    describe('useDamages', () => {
        it('should fetch damages list successfully', async () => {
            const mockDamages = [createMockDamage()];
            const mockResponse = createMockDamageListResponse(mockDamages);
            mockClientGet.mockResolvedValueOnce(mockResponse);
            const { result } = renderHook(() => useDamages(), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
            expect(result.current.data).toEqual(mockResponse);
            expect(mockClientGet).toHaveBeenCalledWith('/api/admin/damages?page=0&size=20');
        });
        it('should fetch with filters', async () => {
            mockClientGet.mockResolvedValueOnce(createMockDamageListResponse([]));
            renderHook(() => useDamages({ severity: 'MAJOR', status: 'REPORTED' }, 1, 10), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => {
                expect(mockClientGet).toHaveBeenCalledWith('/api/admin/damages?severity=MAJOR&status=REPORTED&page=1&size=10');
            });
        });
    });
    describe('useDamageDetail', () => {
        it('should fetch damage detail successfully', async () => {
            const mockDamage = createMockDamage({ id: 1 });
            mockClientGet.mockResolvedValueOnce(mockDamage);
            const { result } = renderHook(() => useDamageDetail(1), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
            expect(result.current.data).toEqual(mockDamage);
            expect(mockClientGet).toHaveBeenCalledWith('/api/admin/damages/1');
        });
        it('should not fetch when id is missing', () => {
            const { result } = renderHook(() => useDamageDetail(null), {
                wrapper: createQueryWrapper(),
            });
            expect(result.current.fetchStatus).toBe('idle');
            expect(mockClientGet).not.toHaveBeenCalled();
        });
    });
    describe('useCreateDamage', () => {
        it('should create damage report successfully', async () => {
            const mockDamage = createMockDamage();
            mockClientPost.mockResolvedValueOnce(mockDamage);
            const { result } = renderHook(() => useCreateDamage(), {
                wrapper: createQueryWrapper(),
            });
            const request = { description: 'New damage', initialSeverity: 'MINOR' as const };
            await result.current.mutateAsync({ rentalId: 10, request });
            expect(mockClientPost).toHaveBeenCalledWith('/api/admin/damages?rentalId=10', request);
            expect(mockToast.success).toHaveBeenCalledWith('Damage report created successfully');
        });
        it('should handle creation error', async () => {
            mockClientPost.mockRejectedValue(new Error('API error'));
            const { result } = renderHook(() => useCreateDamage(), {
                wrapper: createQueryWrapper(),
            });
            await result.current.mutate({ rentalId: 10, request: { description: 'desc' } });
            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });
            expect(mockToast.error).toHaveBeenCalledWith('Failed to create damage report', 'API error');
        });
    });
    describe('useAssessDamage', () => {
        it('should assess damage successfully', async () => {
            const mockDamage = createMockDamage();
            mockClientPost.mockResolvedValueOnce(mockDamage);
            const { result } = renderHook(() => useAssessDamage(), {
                wrapper: createQueryWrapper(),
            });
            const request = { severity: 'MODERATE' as const, category: 'DENT' as const, repairCostEstimate: 500 };
            await result.current.mutateAsync({ damageId: 1, request });
            expect(mockClientPost).toHaveBeenCalledWith('/api/admin/damages/1/assess', request);
            expect(mockToast.success).toHaveBeenCalledWith('Damage assessed successfully');
        });
    });
    describe('useDisputeDamage', () => {
        it('should dispute damage successfully', async () => {
            const mockDamage = createMockDamage();
            mockClientPost.mockResolvedValueOnce(mockDamage);
            const { result } = renderHook(() => useDisputeDamage(), {
                wrapper: createQueryWrapper(),
            });
            const request = { reason: 'Incorrect assessment' };
            await result.current.mutateAsync({ damageId: 1, request });
            expect(mockClientPost).toHaveBeenCalledWith('/api/damages/1/dispute', request);
            expect(mockToast.success).toHaveBeenCalledWith('Dispute submitted successfully');
        });
    });
    describe('useResolveDamage', () => {
        it('should resolve damage dispute successfully', async () => {
            const mockDamage = createMockDamage();
            mockClientPost.mockResolvedValueOnce(mockDamage);
            const { result } = renderHook(() => useResolveDamage(), {
                wrapper: createQueryWrapper(),
            });
            const resolution = { adjustedRepairCost: 400, adjustedCustomerLiability: 100, resolutionNotes: 'Agreed' };
            await result.current.mutateAsync({ damageId: 1, resolution });
            expect(mockClientPost).toHaveBeenCalledWith('/api/admin/damages/1/resolve', resolution);
            expect(mockToast.success).toHaveBeenCalledWith('Dispute resolved successfully');
        });
    });
});