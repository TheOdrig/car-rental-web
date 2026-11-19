import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/app/testing/test-utils';
import { ApiError, clientDelete, clientPost } from '@/shared/api';
import { showToast } from '@/shared/lib';
import { useChangeCarStatus, useDeleteCar } from '../fleet-api';

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

const mockClientPost = vi.mocked(clientPost);
const mockClientDelete = vi.mocked(clientDelete);
const mockToast = vi.mocked(showToast);

describe('fleet mutations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deletes a car through the admin endpoint and confirms with a toast', async () => {
        mockClientDelete.mockResolvedValueOnce(undefined);
        const { result } = renderHook(() => useDeleteCar(), { wrapper: createQueryWrapper() });

        result.current.mutate(12);

        await waitFor(() => expect(mockToast.success).toHaveBeenCalled());
        expect(mockClientDelete).toHaveBeenCalledWith('/api/admin/cars/12');
        expect(mockToast.success).toHaveBeenCalledWith(
            'Car removed from fleet',
            'The vehicle was archived and can be restored.',
            expect.objectContaining({ label: 'Undo' })
        );
    });

    it('posts the new status and reason when changing a car status', async () => {
        mockClientPost.mockResolvedValueOnce({ id: 3, brand: 'Fiat', model: 'Egea' });
        const { result } = renderHook(() => useChangeCarStatus(), { wrapper: createQueryWrapper() });

        result.current.mutate({ id: 3, status: 'MAINTENANCE', reason: 'Brake service' });

        await waitFor(() => expect(mockToast.success).toHaveBeenCalled());
        expect(mockClientPost).toHaveBeenCalledWith('/api/admin/cars/3/status', {
            status: 'MAINTENANCE',
            reason: 'Brake service',
        });
        expect(mockToast.success).toHaveBeenCalledWith('Status updated', 'Fiat Egea status has been changed.');
    });

    it('shows the failure toast when a status change is rejected', async () => {
        mockClientPost.mockRejectedValueOnce(
            new ApiError({ status: 409, message: 'Car is on rent', timestamp: new Date().toISOString() })
        );
        const { result } = renderHook(() => useChangeCarStatus(), { wrapper: createQueryWrapper() });

        result.current.mutate({ id: 3, status: 'MAINTENANCE' });

        await waitFor(() => expect(mockToast.error).toHaveBeenCalled());
        expect(mockToast.error).toHaveBeenCalledWith('Failed to change status', expect.any(String));
        expect(mockToast.success).not.toHaveBeenCalled();
    });
});

describe('vehicle detail', () => {
    it('reads the flat admin car and invents no weekly rate or deposit', async () => {
        const { clientGet } = await import('@/shared/api');
        vi.mocked(clientGet).mockResolvedValueOnce({
            id: 22,
            brand: 'Toyota',
            model: 'QA-TRY',
            productionYear: 2022,
            licensePlate: '34QA22',
            carStatusType: 'MAINTENANCE',
            price: 1500.5,
            currencyType: 'TRY',
            imageUrl: 'https://cdn.example.com/a.jpg',
        });
        const { useVehicleDetail } = await import('../fleet-api');
        const { result } = renderHook(() => useVehicleDetail(22), { wrapper: createQueryWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(vi.mocked(clientGet)).toHaveBeenCalledWith('/api/admin/cars/22');
        expect(result.current.data).toMatchObject({
            brand: 'Toyota',
            year: 2022,
            status: 'MAINTENANCE',
            pricing: { dailyRate: 1500.5, currency: 'TRY' },
        });
        expect(result.current.data?.pricing).not.toHaveProperty('weeklyRate');
        expect(result.current.data?.pricing).not.toHaveProperty('depositAmount');
    });
});

describe('restoring a car', () => {
    it('posts to the restore route', async () => {
        mockClientPost.mockResolvedValueOnce(undefined);
        const { useRestoreCar } = await import('../fleet-api');
        const { result } = renderHook(() => useRestoreCar(), { wrapper: createQueryWrapper() });

        result.current.mutate(12);

        await waitFor(() => expect(mockToast.success).toHaveBeenCalledWith('Car restored', expect.any(String)));
        expect(mockClientPost).toHaveBeenCalledWith('/api/admin/cars/12/restore');
    });
});
