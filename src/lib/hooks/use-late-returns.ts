'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientGet, clientPost } from '@/lib/api/client';
import { showToast } from '@/lib/utils/toast';
import type {
    LateReturnFilters,
    LateReturnStatistics,
    PaginatedLateReturns,
    PenaltyWaiverRequest,
    PenaltyWaiverResponse,
} from '@/types';

export const lateReturnKeys = {
    all: ['late-returns'] as const,
    lists: () => [...lateReturnKeys.all, 'list'] as const,
    list: (filters?: LateReturnFilters, page?: number, size?: number) =>
        [...lateReturnKeys.lists(), filters, page, size] as const,
    statistics: () => [...lateReturnKeys.all, 'statistics'] as const,
    statisticsWithRange: (startDate?: string, endDate?: string) =>
        [...lateReturnKeys.statistics(), startDate, endDate] as const,
    penaltyHistory: (rentalId: number) =>
        [...lateReturnKeys.all, 'penalty-history', rentalId] as const,
};

function buildQueryString(filters?: LateReturnFilters, page?: number, size?: number): string {
    const params = new URLSearchParams();

    if (page !== undefined) params.append('page', String(page));
    if (size !== undefined) params.append('size', String(size));

    if (filters) {
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.status) params.append('status', filters.status);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);
    }

    return params.toString();
}

async function fetchLateReturns(
    filters?: LateReturnFilters,
    page = 0,
    size = 20
): Promise<PaginatedLateReturns> {
    const queryString = buildQueryString(filters, page, size);
    const url = queryString
        ? `/api/admin/late-returns?${queryString}`
        : '/api/admin/late-returns';

    return clientGet<PaginatedLateReturns>(url);
}

async function fetchLateReturnStatistics(
    startDate?: string,
    endDate?: string
): Promise<LateReturnStatistics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const url = queryString
        ? `/api/admin/late-returns/statistics?${queryString}`
        : '/api/admin/late-returns/statistics';

    return clientGet<LateReturnStatistics>(url);
}

async function fetchPenaltyHistory(rentalId: number): Promise<PenaltyWaiverResponse[]> {
    return clientGet<PenaltyWaiverResponse[]>(`/api/admin/rentals/${rentalId}/penalty/history`);
}

async function waivePenalty(
    rentalId: number,
    request: PenaltyWaiverRequest
): Promise<PenaltyWaiverResponse> {
    return clientPost<PenaltyWaiverResponse>(
        `/api/admin/rentals/${rentalId}/penalty/waive`,
        request
    );
}

export function useLateReturns(filters?: LateReturnFilters, page = 0, size = 20) {
    return useQuery({
        queryKey: lateReturnKeys.list(filters, page, size),
        queryFn: () => fetchLateReturns(filters, page, size),
        staleTime: 30 * 1000,
    });
}

export function useLateReturnStatistics(startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: lateReturnKeys.statisticsWithRange(startDate, endDate),
        queryFn: () => fetchLateReturnStatistics(startDate, endDate),
        staleTime: 60 * 1000,
    });
}

export function usePenaltyHistory(rentalId: number | null | undefined) {
    return useQuery({
        queryKey: lateReturnKeys.penaltyHistory(rentalId!),
        queryFn: () => fetchPenaltyHistory(rentalId!),
        enabled: !!rentalId,
        staleTime: 60 * 1000,
    });
}

export function useWaivePenalty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ rentalId, request }: { rentalId: number; request: PenaltyWaiverRequest }) =>
            waivePenalty(rentalId, request),
        onSuccess: (_data, variables) => {
            showToast.success('Penalty waived successfully');
            void queryClient.invalidateQueries({ queryKey: lateReturnKeys.all });
            void queryClient.invalidateQueries({
                queryKey: lateReturnKeys.penaltyHistory(variables.rentalId),
            });
            void queryClient.invalidateQueries({ queryKey: ['rentals', 'detail', variables.rentalId] });
        },
        onError: (error: Error) => {
            showToast.error('Failed to waive penalty', error.message);
        },
    });
}

export function useInvalidateLateReturns() {
    const queryClient = useQueryClient();

    return {
        all: () => queryClient.invalidateQueries({ queryKey: lateReturnKeys.all }),
        lists: () => queryClient.invalidateQueries({ queryKey: lateReturnKeys.lists() }),
        statistics: () => queryClient.invalidateQueries({ queryKey: lateReturnKeys.statistics() }),
        penaltyHistory: (rentalId: number) =>
            queryClient.invalidateQueries({ queryKey: lateReturnKeys.penaltyHistory(rentalId) }),
    };
}

