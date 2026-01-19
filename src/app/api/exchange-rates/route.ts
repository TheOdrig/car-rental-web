import { NextResponse } from 'next/server';
import { serverGet } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';
import type { ExchangeRatesResponse } from '@/types';

export async function GET() {
    try {
        const data = await serverGet<ExchangeRatesResponse>(endpoints.currency.rates, {
            revalidate: 60,
            tags: ['exchange-rates'],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/exchange-rates error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch exchange rates' },
            { status: 503 }
        );
    }
}
