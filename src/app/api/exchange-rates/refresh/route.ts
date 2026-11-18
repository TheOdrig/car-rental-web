import { revalidatePath } from 'next/cache';
import { API, route, upstream } from '@/shared/server';

export const POST = route(
    async () => {
        const data = await upstream.post<unknown>(API.exchangeRates.refresh.resolve(), undefined, { cache: 'no-store' });
        revalidatePath('/api/exchange-rates');
        return data ?? { success: true };
    },
    { errorMessage: 'Failed to refresh exchange rates', errorStatus: 503 }
);
