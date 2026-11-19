import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/app/testing/test-utils';
import { ApiError, clientGet, clientPost } from '@/shared/api';
import { showToast } from '@/shared/lib';
import { ADMIN_CAR_NOT_AVAILABLE_MESSAGE } from '@/entities/rental';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { rentalKeys } from '@/entities/rental';
import { useRentalActions } from '../../lib/use-rental-actions';
import { processKeys } from '../process-keys';
import { useApproveRental, useProcessPickup, useProcessReturn, useRejectRental, useRentalDetail } from '../process-api';

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
const mockGet = vi.mocked(clientGet);

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

describe('pickup refused by the API on the rental dates', () => {
    const apiMessage = 'Pickup is only allowed until 2026-11-19';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    function refusal(): ApiError {
        return new ApiError({
            status: 400,
            message: apiMessage,
            timestamp: new Date().toISOString(),
            code: 'RENTAL_VALIDATION_FAILED',
        });
    }

    function observedWrapper() {
        const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
        const wrapper = ({ children }: { children: ReactNode }) =>
            createElement(QueryClientProvider, { client }, children);
        return { client, wrapper };
    }

    it('shows the API message and refreshes the rental detail', async () => {
        mockClientPost.mockRejectedValueOnce(refusal());
        mockGet.mockResolvedValue({ id: 5 });
        const { wrapper } = observedWrapper();
        const { result } = renderHook(
            () => ({ pickup: useProcessPickup(), detail: useRentalDetail(5) }),
            { wrapper }
        );
        await waitFor(() => expect(result.current.detail.isFetching).toBe(false));
        const fetchesBefore = mockGet.mock.calls.length;

        result.current.pickup.mutate({ rentalId: 5 });

        await waitFor(() => expect(mockToast.error).toHaveBeenCalled());
        expect(mockToast.error).toHaveBeenCalledWith('Failed to process pickup', apiMessage);
        await waitFor(() => expect(mockGet.mock.calls.length).toBeGreaterThan(fetchesBefore));
    });

    it('does not refresh anything for an unrelated pickup failure', async () => {
        mockClientPost.mockRejectedValueOnce(new Error('boom'));
        const { client, wrapper } = observedWrapper();
        const invalidate = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useProcessPickup(), { wrapper });

        result.current.mutate({ rentalId: 5 });

        await waitFor(() => expect(mockToast.error).toHaveBeenCalled());
        expect(invalidate).not.toHaveBeenCalled();
    });

    it('shows the same message and refreshes the lists when started from the quick action', async () => {
        mockClientPost.mockRejectedValueOnce(refusal());
        const { client, wrapper } = observedWrapper();
        const invalidate = vi.spyOn(client, 'invalidateQueries');
        const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const { result } = renderHook(() => useRentalActions(), { wrapper });

        await result.current.pickup(5);

        expect(mockToast.error).toHaveBeenCalledWith('Failed to process pickup', apiMessage);
        const keys = invalidate.mock.calls.map(([filters]) => filters?.queryKey);
        expect(keys).toContainEqual(processKeys.all);
        expect(keys).toContainEqual(rentalKeys.all);
        errorLog.mockRestore();
    });
});

describe('early return', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('posts to the early-return route and tells the admin about the refund', async () => {
        mockClientPost.mockResolvedValueOnce({ success: true, message: 'ok' });
        const { useProcessEarlyReturn } = await import('../process-api');
        const { result } = renderHook(() => useProcessEarlyReturn(), { wrapper: createQueryWrapper() });

        result.current.mutate({ rentalId: 7 });

        await waitFor(() => expect(mockToast.success).toHaveBeenCalledWith('Early return recorded', expect.stringMatching(/refund/i)));
        expect(mockClientPost).toHaveBeenCalledWith('/api/admin/rentals/7/early-return', undefined);
    });

    it('shows the failure toast with the API message', async () => {
        mockClientPost.mockRejectedValueOnce(new ApiError({ status: 400, message: 'Not in use', timestamp: new Date().toISOString() }));
        const { useProcessEarlyReturn } = await import('../process-api');
        const { result } = renderHook(() => useProcessEarlyReturn(), { wrapper: createQueryWrapper() });

        result.current.mutate({ rentalId: 7 });

        await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith('Failed to record the early return', 'Not in use'));
    });
});
