import { NextRequest, NextResponse } from 'next/server';
import { routeGet } from '@/shared/api/route-handler';
import { isApiError } from '@/shared/api';
import { ADMIN_ENDPOINTS } from '@/features/admin';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const queryString = searchParams.toString();

        const url = queryString
            ? `${ADMIN_ENDPOINTS.users.list}?${queryString}`
            : ADMIN_ENDPOINTS.users.list;

        const data = await routeGet(url, {
            cache: 'no-store',
            tags: ['admin', 'users'],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/users error:', error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 503 }
        );
    }
}
