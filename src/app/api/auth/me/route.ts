import { ApiError } from '@/shared/api';
import { getAccessToken, renewAccessToken, route, verifyAccessToken } from '@/shared/server';

export const GET = route(
    async () => {
        let session = await verifyAccessToken(await getAccessToken());

        if (!session) {
            session = await verifyAccessToken(await renewAccessToken());
        }

        if (!session) {
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
