import { NextResponse } from 'next/server';
import { serverPost } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';
import { getAccessToken } from '@/lib/auth';
import type { ExchangeRatesResponse } from '@/types';

export async function POST() {
    try {
        const token = await getAccessToken();

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const data = await serverPost<ExchangeRatesResponse>(endpoints.currency.refresh);

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] POST /api/exchange-rates/refresh error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to refresh exchange rates' },
            { status: 503 }
        );
    }
}
