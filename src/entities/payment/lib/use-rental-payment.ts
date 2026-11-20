'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, type Query } from '@tanstack/react-query';
import { clientGet, clientPost, isApiError } from '@/shared/api';
import { PAYMENT_ENDPOINTS } from '../api/endpoints';
import {
    PAYMENT_POLL_CAP_MS,
    isPollingDone,
    nextPollDelay,
    type PaymentIntent,
    type RentalPayment,
} from '../model/rental-payment';
import { STALE_TIME } from '@/shared/config/constants';

export const paymentKeys = {
    byRental: (rentalId: number) => ['rentals', 'payment', rentalId] as const,
    intent: (rentalId: number, attempt: number) => ['rentals', 'payment-intent', rentalId, attempt] as const,
};

function isClientError(error: unknown): boolean {
    return isApiError(error) && error.status >= 400 && error.status < 500;
}

interface UseRentalPaymentOptions {
    poll?: boolean;
    enabled?: boolean;
    runKey?: number;
}

export function useRentalPayment(rentalId: number, options: UseRentalPaymentOptions = {}) {
    const { poll = false, enabled = true, runKey = 0 } = options;
    const startedAt = useRef<number | null>(null);
    const [timedOutRun, setTimedOutRun] = useState<string | null>(null);
    const runId = `${rentalId}:${runKey}`;

    useEffect(() => {
        if (!poll) {
            startedAt.current = null;
            return;
        }

        startedAt.current = Date.now();
        const timer = setTimeout(() => setTimedOutRun(runId), PAYMENT_POLL_CAP_MS);
        return () => clearTimeout(timer);
    }, [poll, runId]);

    const query = useQuery({
        queryKey: paymentKeys.byRental(rentalId),
        queryFn: ({ signal }) => clientGet<RentalPayment>(PAYMENT_ENDPOINTS.byRental(rentalId), { signal }),
        enabled,
        staleTime: STALE_TIME.NONE,
        retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
        refetchInterval: poll
            ? (current: Query<RentalPayment>) => {
                  if (current.state.data && isPollingDone(current.state.data.status)) return false;
                  if (isClientError(current.state.error)) return false;
                  const started = startedAt.current ?? Date.now();
                  if (Date.now() - started >= PAYMENT_POLL_CAP_MS) return false;
                  return nextPollDelay(current.state.dataUpdateCount);
              }
            : false,
    });

    const settled = query.data ? isPollingDone(query.data.status) : false;

    return { ...query, timedOut: poll && timedOutRun === runId && !settled };
}

export function usePaymentIntent(rentalId: number, attempt: number, enabled = true) {
    return useQuery({
        queryKey: paymentKeys.intent(rentalId, attempt),
        queryFn: () => clientPost<PaymentIntent>(PAYMENT_ENDPOINTS.intent(rentalId)),
        enabled,
        staleTime: STALE_TIME.FOREVER,
        gcTime: 0,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}
