import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/app/testing/test-utils';
import { ApiError, clientPost } from '@/shared/api';
import { showToast } from '@/shared/lib';
import { ADMIN_CAR_NOT_AVAILABLE_MESSAGE } from '@/entities/rental';
import { useApproveRental, useProcessPickup, useProcessReturn, useRejectRental } from '../process-api';

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

const mockClientPost = vi.mocked(clientPost);
const mockToast = vi.mocked(showToast);

function carNotAvailable(status: number, message: string): ApiError {
    return new ApiError({ status, message, timestamp: new Date().toISOString(), code: 'CAR_NOT_AVAILABLE' });
}

describe('admin rental actions error handling', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('explains a 409 pickup conflict', async () => {
        mockClientPost.mockRejectedValueOnce(carNotAvailable(409, 'Car with id 5 is still out on another rental'));
        const { result } = renderHook(() => useProcessPickup(), { wrapper: createQueryWrapper() });

        result.current.mutate({ rentalId: 5 });

        await waitFor(() => expect(mockToast.error).toHaveBeenCalled());
        expect(mockToast.error).toHaveBeenCalledWith('Failed to process pickup', ADMIN_CAR_NOT_AVAILABLE_MESSAGE);
    });

    it('explains a 400 pickup conflict when the car is in maintenance', async () => {
        mockClientPost.mockRejectedValueOnce(
            carNotAvailable(400, 'Car with id 5 is not available for rental. Reason: Maintenance')
        );
        const { result } = renderHook(() => useProcessPickup(), { wrapper: createQueryWrapper() });

        result.current.mutate({ rentalId: 5 });

        await waitFor(() => expect(mockToast.error).toHaveBeenCalled());
        expect(mockToast.error).toHaveBeenCalledWith('Failed to process pickup', ADMIN_CAR_NOT_AVAILABLE_MESSAGE);
    });

    it('explains a confirm conflict on approve', async () => {
        mockClientPost.mockRejectedValueOnce(carNotAvailable(400, 'Car status is: Maintenance'));
        const { result } = renderHook(() => useApproveRental(), { wrapper: createQueryWrapper() });

        result.current.mutate({ rentalId: 7 });

        await waitFor(() => expect(mockToast.error).toHaveBeenCalled());
        expect(mockToast.error).toHaveBeenCalledWith('Failed to approve rental', ADMIN_CAR_NOT_AVAILABLE_MESSAGE);
    });

    it('shows the retry hint when an admin action is rate limited', async () => {
        mockClientPost.mockRejectedValueOnce(
            new ApiError({
                status: 429,
                message: 'Too many requests',
                timestamp: new Date().toISOString(),
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: 12,
            })
        );
        const { result } = renderHook(() => useProcessReturn(), { wrapper: createQueryWrapper() });

        result.current.mutate({ rentalId: 3, data: undefined });

        await waitFor(() => expect(mockToast.error).toHaveBeenCalled());
        expect(mockToast.error).toHaveBeenCalledWith(
            'Failed to process return',
            'Too many attempts. Please try again in 12 seconds.'
        );
    });

    it('keeps the API message for other failures', async () => {
        mockClientPost.mockRejectedValueOnce(new Error('Rental is not in a state that allows rejection'));
        const { result } = renderHook(() => useRejectRental(), { wrapper: createQueryWrapper() });

        result.current.mutate({ rentalId: 9, reason: 'No stock' });

        await waitFor(() => expect(mockToast.error).toHaveBeenCalled());
        expect(mockToast.error).toHaveBeenCalledWith(
            'Failed to reject rental',
            'Rental is not in a state that allows rejection'
        );
    });
});
