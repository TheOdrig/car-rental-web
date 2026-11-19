import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ApiError } from '@/shared/api/error';

const clientGet = vi.fn();
const clientPost = vi.fn();

vi.mock('@/shared/api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/shared/api')>();
    return { ...actual, clientGet: (...args: unknown[]) => clientGet(...args), clientPost: (...args: unknown[]) => clientPost(...args) };
});

import { useRentalPayment, usePaymentIntent } from '../use-rental-payment';
import {
    PAYMENT_POLL_CAP_MS,
    PAYMENT_POLL_MAX_MS,
    isPayableStatus,
    isPaymentSecured,
    isPollingDone,
    nextPollDelay,
    type RentalPayment,
    type RentalPaymentStatus,
} from '../../model/rental-payment';

function payment(status: RentalPaymentStatus): RentalPayment {
    return { paymentId: 1, rentalId: 5, status, amount: 100, currency: 'USD', refundedAmount: null, failureReason: null };
}

function makeWrapper() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const Wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    return { Wrapper, client };
}

async function advance(ms: number) {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(ms);
    });
}

describe('payment status helpers', () => {
    it('stops polling on AUTHORIZED, CAPTURED and FAILED only', () => {
        expect(isPollingDone('AUTHORIZED')).toBe(true);
        expect(isPollingDone('CAPTURED')).toBe(true);
        expect(isPollingDone('FAILED')).toBe(true);
        expect(isPollingDone('PENDING')).toBe(false);
        expect(isPollingDone('REFUNDED')).toBe(false);
    });

    it('backs off up to a maximum', () => {
        const delays = [0, 1, 2, 3, 4, 5, 10].map(nextPollDelay);
        for (let i = 1; i < delays.length; i += 1) {
            expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1]);
        }
        expect(delays.slice(0, 3)).toEqual([1000, 2000, 4000]);
        expect(delays.at(-1)).toBe(PAYMENT_POLL_MAX_MS);
    });

    it('classifies payable and secured statuses', () => {
        expect(isPayableStatus(undefined)).toBe(true);
        expect(isPayableStatus('PENDING')).toBe(true);
        expect(isPayableStatus('FAILED')).toBe(true);
        expect(isPayableStatus('AUTHORIZED')).toBe(false);
        expect(isPayableStatus('CAPTURED')).toBe(false);
        expect(isPaymentSecured('AUTHORIZED')).toBe(true);
        expect(isPaymentSecured('CAPTURED')).toBe(true);
        expect(isPaymentSecured('PENDING')).toBe(false);
        expect(isPaymentSecured(undefined)).toBe(false);
    });
});

describe('useRentalPayment polling', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        clientGet.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('fetches once and does not poll when polling is off', async () => {
        clientGet.mockResolvedValue(payment('PENDING'));
        const { Wrapper } = makeWrapper();

        const { result } = renderHook(() => useRentalPayment(5), { wrapper: Wrapper });
        await advance(60_000);

        expect(clientGet).toHaveBeenCalledTimes(1);
        expect(clientGet.mock.calls[0][0]).toBe('/api/rentals/5/payment');
        expect(result.current.data?.status).toBe('PENDING');
    });

    it('polls with growing gaps while the payment is pending', async () => {
        const times: number[] = [];
        clientGet.mockImplementation(async () => {
            times.push(Date.now());
            return payment('PENDING');
        });
        const { Wrapper } = makeWrapper();

        renderHook(() => useRentalPayment(5, { poll: true }), { wrapper: Wrapper });
        await advance(25_000);

        expect(times.length).toBeGreaterThan(4);
        const gaps = times.slice(1).map((time, index) => time - times[index]);
        expect(gaps[0]).toBeGreaterThanOrEqual(1000);
        for (let i = 1; i < gaps.length; i += 1) {
            expect(gaps[i]).toBeGreaterThanOrEqual(gaps[i - 1]);
            expect(gaps[i]).toBeLessThanOrEqual(PAYMENT_POLL_MAX_MS + 50);
        }
    });

    it('stops polling once the payment is authorized', async () => {
        clientGet
            .mockResolvedValueOnce(payment('PENDING'))
            .mockResolvedValueOnce(payment('PENDING'))
            .mockResolvedValue(payment('AUTHORIZED'));
        const { Wrapper } = makeWrapper();

        const { result } = renderHook(() => useRentalPayment(5, { poll: true }), { wrapper: Wrapper });
        await advance(30_000);

        expect(clientGet).toHaveBeenCalledTimes(3);
        expect(result.current.data?.status).toBe('AUTHORIZED');
        expect(result.current.timedOut).toBe(false);

        await advance(60_000);
        expect(clientGet).toHaveBeenCalledTimes(3);
    });

    it.each(['CAPTURED', 'FAILED'] as const)('stops polling on %s', async (status) => {
        clientGet.mockResolvedValueOnce(payment('PENDING')).mockResolvedValue(payment(status));
        const { Wrapper } = makeWrapper();

        const { result } = renderHook(() => useRentalPayment(5, { poll: true }), { wrapper: Wrapper });
        await advance(60_000);

        expect(clientGet).toHaveBeenCalledTimes(2);
        expect(result.current.data?.status).toBe(status);
    });

    it('gives up after the 30 second cap and reports a timeout', async () => {
        clientGet.mockResolvedValue(payment('PENDING'));
        const { Wrapper } = makeWrapper();

        const { result } = renderHook(() => useRentalPayment(5, { poll: true }), { wrapper: Wrapper });
        await advance(PAYMENT_POLL_CAP_MS + 10_000);

        expect(result.current.timedOut).toBe(true);
        const callsAtCap = clientGet.mock.calls.length;
        expect(callsAtCap).toBeGreaterThan(4);

        await advance(120_000);
        expect(clientGet).toHaveBeenCalledTimes(callsAtCap);
    });

    it('stops polling on a client error such as 403', async () => {
        clientGet.mockRejectedValue(new ApiError(403, 'Forbidden'));
        const { Wrapper } = makeWrapper();

        const { result } = renderHook(() => useRentalPayment(5, { poll: true }), { wrapper: Wrapper });
        await advance(60_000);

        expect(clientGet).toHaveBeenCalledTimes(1);
        expect(result.current.error).toBeInstanceOf(ApiError);
    });

    it('does not fetch while disabled', async () => {
        const { Wrapper } = makeWrapper();

        renderHook(() => useRentalPayment(5, { poll: true, enabled: false }), { wrapper: Wrapper });
        await advance(10_000);

        expect(clientGet).not.toHaveBeenCalled();
    });
});

describe('usePaymentIntent', () => {
    beforeEach(() => {
        clientPost.mockReset();
    });

    it('posts to the intent endpoint without a body', async () => {
        clientPost.mockResolvedValue({ paymentId: 1 });
        const { Wrapper } = makeWrapper();

        const { result } = renderHook(() => usePaymentIntent(9, 0), { wrapper: Wrapper });
        await vi.waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(clientPost).toHaveBeenCalledTimes(1);
        expect(clientPost.mock.calls[0]).toEqual(['/api/rentals/9/payment-intent']);
    });

    it('does not post while disabled', async () => {
        const { Wrapper } = makeWrapper();

        const { result } = renderHook(() => usePaymentIntent(9, 0, false), { wrapper: Wrapper });

        expect(result.current.fetchStatus).toBe('idle');
        expect(result.current.isPending).toBe(true);
        expect(clientPost).not.toHaveBeenCalled();
    });
});
