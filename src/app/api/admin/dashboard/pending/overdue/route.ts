import { NextRequest, NextResponse } from 'next/server';
import { serverGet } from '@/lib/api/server';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';
import type { PendingItem, PageResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const backendUrl = new URL(endpoints.admin.dashboard.pending.overdue);
        searchParams.forEach((value, key) => {
            backendUrl.searchParams.append(key, value);
        });

        const data = await serverGet<PageResponse<PendingItem>>(backendUrl.toString(), {
            cache: 'no-store',
            tags: ['admin', 'pending', 'overdue'],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/dashboard/pending/overdue error:', error);

        if (isApiException(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch overdue rentals' },
            { status: 503 }
        );
    }
}
