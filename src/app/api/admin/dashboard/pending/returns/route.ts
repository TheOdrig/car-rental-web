import { NextRequest, NextResponse } from 'next/server';
import { routeGet } from '@/shared/api/route-handler';
import { endpoints } from '@/shared/api';
import { isApiError } from '@/shared/api';
import type { PendingItem } from '@/features/admin';
import type { PageResponse } from '@/shared/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const backendUrl = new URL(endpoints.admin.dashboard.pending.returns);
        searchParams.forEach((value, key) => {
            backendUrl.searchParams.append(key, value);
        });

        const data = await routeGet<PageResponse<PendingItem>>(backendUrl.toString(), {
            cache: 'no-store',
            tags: ['admin', 'pending', 'returns'],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/dashboard/pending/returns error:', error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch pending returns' },
            { status: 503 }
        );
    }
}
