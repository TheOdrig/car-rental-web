import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/app/testing/test-utils';
import {
    useDashboardSummary,
    useFleetStatus,
    usePendingApprovals,
    useRevenueData,
    useAlerts,
    useDismissAlert,
    useMarkAllAlertsRead
} from '../use-admin-dashboard';
import { clientGet, clientPost } from '@/shared/api';
import { showToast } from '@/shared/lib';

vi.mock('@/shared/api', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/api')>();
    return {
        ...original,
        clientGet: vi.fn(),
        clientPost: vi.fn(),
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
        it('should map unacknowledged alerts to admin alerts', async () => {
            mockClientGet.mockResolvedValueOnce([
                { id: 1, severity: 'HIGH', title: 'Late return', message: 'Rental 4 is late', createdAt: '2026-11-18T10:00:00Z', acknowledged: false },
                { id: 2, severity: 'LOW', title: 'Seen', message: 'done', acknowledged: true },
            ]);
            const { result } = renderHook(() => useAlerts(), {
                wrapper: createQueryWrapper(),
            });
            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
            expect(result.current.data).toEqual([
                {
                    id: '1',
                    type: 'critical',
                    title: 'Late return',
                    description: 'Rental 4 is late',
                    timestamp: '2026-11-18T10:00:00Z',
                    dismissible: true,
                },
            ]);
            expect(mockClientGet).toHaveBeenCalledWith('/api/admin/alerts');
        });
    });
    describe('useDismissAlert', () => {
        it('should acknowledge the alert', async () => {
            mockClientPost.mockResolvedValueOnce({ id: 7, acknowledged: true });
            const { result } = renderHook(() => useDismissAlert(), {
                wrapper: createQueryWrapper(),
            });
            await result.current.mutateAsync('7');
            expect(mockClientPost).toHaveBeenCalledWith('/api/admin/alerts/7/acknowledge');
        });
    });
    describe('useMarkAllAlertsRead', () => {
        it('should acknowledge every unacknowledged alert', async () => {
            mockClientGet.mockResolvedValueOnce([
                { id: 1, acknowledged: false },
                { id: 2, acknowledged: true },
                { id: 3, acknowledged: false },
            ]);
            mockClientPost.mockResolvedValue({ acknowledged: true });
            const { result } = renderHook(() => useMarkAllAlertsRead(), {
                wrapper: createQueryWrapper(),
            });
            await result.current.mutateAsync();
            expect(mockClientPost).toHaveBeenCalledTimes(2);
            expect(mockClientPost).toHaveBeenCalledWith('/api/admin/alerts/1/acknowledge');
            expect(mockClientPost).toHaveBeenCalledWith('/api/admin/alerts/3/acknowledge');
            expect(mockToast.success).toHaveBeenCalledWith('All alerts marked as read');
        });
    });
});
describe('alert targets', () => {
    it('keeps admin paths from the API and drops anything else', async () => {
        const { safeAlertTarget } = await import('../use-admin-dashboard');

        expect(safeAlertTarget('/admin/rentals/12')).toBe('/admin/rentals/12');
        expect(safeAlertTarget('/admin/fleet')).toBe('/admin/fleet');
        expect(safeAlertTarget('https://evil.example/admin')).toBeUndefined();
        expect(safeAlertTarget('//evil.example')).toBeUndefined();
        expect(safeAlertTarget('/rentals/1')).toBeUndefined();
        expect(safeAlertTarget('/admin/../x')).toBeUndefined();
        expect(safeAlertTarget(undefined)).toBeUndefined();
    });
});
