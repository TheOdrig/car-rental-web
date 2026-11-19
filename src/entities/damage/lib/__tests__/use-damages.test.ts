import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/app/testing/test-utils';
import { useDamages, useDamageDetail, useMyDamageDetail, useCreateDamage, useAssessDamage, useDisputeDamage, useResolveDamage, useChargeDamage, damageKeys } from '../use-damages';
import { ApiError, clientGet, clientPost } from '@/shared/api';
import { showToast } from '@/shared/lib';
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
            warning: vi.fn(),
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
    describe('useMyDamageDetail', () => {
        it('loads the report, with its photos, from the owner-only endpoint', async () => {
            const target = createMockDamage({
                id: 7,
                photos: [{ id: 1, fileName: 'a.png', secureUrl: '/api/v1/files/damage-photos/a.png', fileSize: 10, uploadedAt: '2026-11-19T10:00:00Z' }],
            });
            mockClientGet.mockResolvedValueOnce(target);

            const { result } = renderHook(() => useMyDamageDetail(7), { wrapper: createQueryWrapper() });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data).toEqual(target);
            expect(mockClientGet).toHaveBeenCalledTimes(1);
            expect(mockClientGet.mock.calls[0][0]).toBe('/api/damages/7');
        });

        it('resolves to null when the API answers 404', async () => {
            mockClientGet.mockRejectedValueOnce(new ApiError({ status: 404, message: 'Not found', timestamp: new Date().toISOString() }));

            const { result } = renderHook(() => useMyDamageDetail(500), { wrapper: createQueryWrapper() });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data).toBeNull();
        });

        it('does not fetch without an id', () => {
            renderHook(() => useMyDamageDetail(null), { wrapper: createQueryWrapper() });

            expect(mockClientGet).not.toHaveBeenCalled();
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
    describe('useChargeDamage', () => {
        const charged = { damageId: 4, status: 'CHARGED', charged: true, amount: 90, currency: 'EUR', transactionId: 'tx', message: 'Charged' };
        it('posts to the charge endpoint and reports a charged card', async () => {
            mockClientPost.mockResolvedValueOnce(charged);
            const { result } = renderHook(() => useChargeDamage(), { wrapper: createQueryWrapper() });
            await result.current.mutateAsync(4);
            expect(mockClientPost).toHaveBeenCalledWith('/api/admin/damages/4/charge');
            expect(mockToast.success).toHaveBeenCalledWith('Customer charged', 'Charged');
        });
        it('warns with the gateway message when the charge is declined', async () => {
            mockClientPost.mockResolvedValueOnce({ ...charged, status: 'ASSESSED', charged: false, message: 'Card declined' });
            const { result } = renderHook(() => useChargeDamage(), { wrapper: createQueryWrapper() });
            await result.current.mutateAsync(4);
            expect(mockToast.warning).toHaveBeenCalledWith('Charge was not completed', 'Card declined');
            expect(mockToast.success).not.toHaveBeenCalled();
        });
        it('reports a rejected request as an error', async () => {
            mockClientPost.mockRejectedValueOnce(new Error('Damage report has no liability'));
            const { result } = renderHook(() => useChargeDamage(), { wrapper: createQueryWrapper() });
            await expect(result.current.mutateAsync(4)).rejects.toThrow();
            expect(mockToast.error).toHaveBeenCalledWith('Failed to charge customer', 'Damage report has no liability');
        });
    });
});