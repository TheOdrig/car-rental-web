import { NextResponse } from 'next/server';
import { routeGet } from '@/shared/api/route-handler';
import { endpoints } from '@/shared/api';
import { isApiError } from '@/shared/api';

export interface UserStatsResponse {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
}

export async function GET() {
    try {
        const data = await routeGet<UserStatsResponse>(endpoints.admin.users.stats, {
            cache: 'no-store',
            tags: ['admin', 'users', 'stats'],
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] GET /api/admin/users/stats error:', error);

        if (isApiError(error)) {
            return NextResponse.json(
                { error: error.message, errors: error.errors },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch user statistics' },
            { status: 503 }
        );
    }
}
