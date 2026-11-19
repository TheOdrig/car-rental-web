import { NextResponse } from 'next/server';
import { ApiError } from '@/shared/api';
import { getAccessToken, renewAccessToken, route, searchParamsOf, verifyAccessToken } from '@/shared/server';

export const GET = route(
    async (request) => {
        let session = await verifyAccessToken(await getAccessToken());

        if (!session) {
            session = await verifyAccessToken(await renewAccessToken());
        }

        if (!session) {
            if (searchParamsOf(request).get('optional') === 'true') {
                return NextResponse.json(null);
            }
            throw new ApiError(401, 'Not authenticated');
        }

        return {
            id: session.userId,
            username: session.username,
            roles: session.roles,
            exp: session.exp,
        };
    },
    { errorMessage: 'Internal server error' }
);
