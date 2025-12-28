import { NextRequest, NextResponse } from 'next/server';
import { serverPost } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const data = await serverPost(endpoints.admin.cars.create, body, {
            cache: 'no-store',
        });

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('[API] POST /api/admin/cars error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create car' },
            { status: 500 }
        );
    }
}
