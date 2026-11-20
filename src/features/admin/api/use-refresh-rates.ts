'use client';

import { useMutation } from '@tanstack/react-query';
import { clientPost } from '@/shared/api';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { toast } from 'sonner';

export function useRefreshExchangeRates() {
    return useMutation({
        mutationFn: () => clientPost(ENDPOINTS.exchangeRates.refresh),
        onSuccess: () => {
            toast.success('Exchange rates refreshed');
            window.location.reload();
        },
        onError: () => {
            toast.error('Failed to refresh exchange rates');
        },
    });
}
