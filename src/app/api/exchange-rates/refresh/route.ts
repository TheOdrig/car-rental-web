import { revalidatePath } from 'next/cache';
import { CURRENCY_ENDPOINTS } from '@/entities/currency';
import { route, upstream } from '@/shared/server';

export const POST = route(
    async () => {
        const data = await upstream.post<unknown>(CURRENCY_ENDPOINTS.refresh, undefined, { cache: 'no-store' });
        revalidatePath('/api/exchange-rates');
        return data ?? { success: true };
    },
    { errorMessage: 'Failed to refresh exchange rates', errorStatus: 503 }
);
