'use client';

import { useQuery } from '@tanstack/react-query';
import { clientGet } from '@/shared/api';
import type { PricingResponse } from '../model/types';
import { STALE_TIME } from '@/shared/config/constants';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { withQuery } from '@/shared/lib/url';

export const pricingKeys = {
    all: ['pricing'] as const,
    preview: (carId: number, startDate: string, endDate: string) =>
        [...pricingKeys.all, 'preview', carId, startDate, endDate] as const,
};

async function fetchPricingPreview(
    carId: number,
    startDate: string,
    endDate: string
): Promise<PricingResponse> {
    const params = new URLSearchParams({
        carId: String(carId),
        startDate,
        endDate,
    });
    return clientGet<PricingResponse>(withQuery(ENDPOINTS.pricing.preview, params.toString()));
}

export function usePricingPreview(
    carId: number | null | undefined,
    startDate: string | null | undefined,
    endDate: string | null | undefined
) {
    return useQuery({
        queryKey: pricingKeys.preview(carId!, startDate!, endDate!),
        queryFn: () => fetchPricingPreview(carId!, startDate!, endDate!),
        enabled: !!carId && !!startDate && !!endDate,
        staleTime: STALE_TIME.MEDIUM,
        retry: 1,
    });
}