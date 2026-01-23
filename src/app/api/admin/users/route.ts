import { NextRequest, NextResponse } from 'next/server';
import { routeGet } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const queryString = searchParams.toString();

        const url = queryString
            ? `${endpoints.admin.users.list}?${queryString}`
            : endpoints.admin.users.list;

        const data = await routeGet(url, {
            cache: 'no-store',
            tags: ['admin', 'users'],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/users error:', error);

        if (isApiException(error)) {
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
