import { NextRequest, NextResponse } from 'next/server';
import { routeGet, routePost } from '@/shared/api/route-handler';
import { isApiError } from '@/shared/api';
import { DAMAGE_ENDPOINTS } from '@/entities/damage';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const data = await routeGet(DAMAGE_ENDPOINTS.admin.search + '?' + searchParams.toString(), {
            cache: 'no-store',
        });
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/damages error:', error);
        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }
        return NextResponse.json(
            { error: 'Failed to fetch damages' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const rentalId = searchParams.get('rentalId');

        if (!rentalId) {
            return NextResponse.json(
                { error: 'rentalId is required' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const data = await routePost(
            `${DAMAGE_ENDPOINTS.admin.list}?rentalId=${rentalId}`,
            body,
            { cache: 'no-store' }
        );
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('[API] POST /api/admin/damages error:', error);
        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }
        return NextResponse.json(
            { error: 'Failed to create damage report' },
            { status: 500 }
        );
    }
}