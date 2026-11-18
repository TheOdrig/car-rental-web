import { CURRENCY_ENDPOINTS } from '@/entities/currency';
import { proxy } from '@/shared/server';

export const dynamic = 'force-dynamic';

export const GET = proxy({
    path: () => CURRENCY_ENDPOINTS.exchangeRates,
    anonymous: true,
    errorMessage: 'Failed to fetch exchange rates',
    errorStatus: 503,
});
