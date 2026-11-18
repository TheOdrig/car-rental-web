import { API, proxy } from '@/shared/server';

export const dynamic = 'force-dynamic';

export const GET = proxy({
    target: () => API.exchangeRates.list.resolve(),
    anonymous: true,
    errorMessage: 'Failed to fetch exchange rates',
    errorStatus: 503,
});
