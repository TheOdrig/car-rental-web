import { NextResponse } from 'next/server';
import { endpoints } from '@/lib/api/endpoints';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const response = await fetch(endpoints.currency.rates, {
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch exchange rates' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/exchange-rates error:', error);

        return NextResponse.json(
            { error: 'Failed to fetch exchange rates' },
            { status: 503 }
        );
    }
}

