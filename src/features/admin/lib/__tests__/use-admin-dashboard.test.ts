import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/app/testing/test-utils';
import {
    useDashboardSummary,
    useFleetStatus,
    usePendingApprovals,
    useRevenueData,
    useAlerts,
    useMarkAllAlertsRead
} from '../use-admin-dashboard';
import { clientGet, clientPost } from '@/shared/api';
import { showToast } from '@/shared/lib';

vi.mock('@/shared/api', () => ({
    clientGet: vi.fn(),
    clientPost: vi.fn(),
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
describe('use-admin-dashboard hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('useDashboardSummary', () => {
        it('should fetch dashboard summary successfully', async () => {
            const mockSummary = { pendingApprovals: 5, todaysPickups: 2 };
            mockClientGet.mockResolvedValueOnce(mockSummary);
            const { result } = renderHook(() => useDashboardSummary(), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
            expect(result.current.data).toEqual(mockSummary);
            expect(mockClientGet).toHaveBeenCalledWith('/api/admin/dashboard');
        });
    });
    describe('useFleetStatus', () => {
        it('should fetch fleet status successfully', async () => {
            const mockFleet = { totalCars: 10, availableCars: 8 };
            mockClientGet.mockResolvedValueOnce(mockFleet);
            const { result } = renderHook(() => useFleetStatus(), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
            expect(result.current.data).toEqual(mockFleet);
            expect(mockClientGet).toHaveBeenCalledWith('/api/admin/fleet');
        });
    });
    describe('usePendingApprovals', () => {
        it('should fetch pending approvals with filters', async () => {
            const mockResponse = { content: [], totalElements: 0 };
            mockClientGet.mockResolvedValueOnce(mockResponse);
            const { result } = renderHook(() => usePendingApprovals({ page: 1, size: 10 }), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
            expect(mockClientGet).toHaveBeenCalledWith('/api/admin/dashboard/pending/approvals?page=1&size=10');
        });
    });
    describe('useRevenueData', () => {
        it('should fetch revenue data successfully', async () => {
            const mockRevenue = { totalRevenue: 1000, monthlyData: [] };
            mockClientGet.mockResolvedValueOnce(mockRevenue);
            const { result } = renderHook(() => useRevenueData(), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
            expect(mockClientGet).toHaveBeenCalledWith('/api/admin/dashboard/revenue');
        });
    });
    describe('useAlerts', () => {
        it('should fetch alerts successfully', async () => {
            const mockAlerts = [{ id: '1', message: 'Low fuel' }];
            mockClientGet.mockResolvedValueOnce(mockAlerts);
            const { result } = renderHook(() => useAlerts(), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
            expect(result.current.data).toEqual(mockAlerts);
            expect(mockClientGet).toHaveBeenCalledWith('/api/admin/alerts');
        });
    });
    describe('useMarkAllAlertsRead', () => {
        it('should mark all alerts as read successfully', async () => {
            mockClientPost.mockResolvedValueOnce(undefined);
            const { result } = renderHook(() => useMarkAllAlertsRead(), {
                wrapper: createQueryWrapper(),
            });
            await result.current.mutateAsync();
            expect(mockClientPost).toHaveBeenCalledWith('/api/admin/alerts/mark-all-read');
            expect(mockToast.success).toHaveBeenCalledWith('All alerts marked as read');
        });
    });
});