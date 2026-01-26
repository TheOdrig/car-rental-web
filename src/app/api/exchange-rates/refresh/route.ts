import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { endpoints } from '@/lib/api/endpoints';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        const response = await fetch(endpoints.currency.refresh, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[API] Backend error:', response.status, errorText);
            return NextResponse.json(
                { error: errorText || 'Failed to refresh exchange rates' },
                { status: response.status }
            );
        }

        revalidatePath('/api/exchange-rates');

        const text = await response.text();
        const data = text ? JSON.parse(text) : { success: true };

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] POST /api/exchange-rates/refresh error:', error);

        return NextResponse.json(
            { error: 'Failed to refresh exchange rates' },
            { status: 503 }
        );
    }
}


