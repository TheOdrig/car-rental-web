import { NextResponse } from 'next/server';
import { routeGet } from '@/lib/api/route-handler';
import { endpoints } from '@/lib/api/endpoints';
import { isApiException } from '@/lib/api/errors';

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

        if (isApiException(error)) {
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

