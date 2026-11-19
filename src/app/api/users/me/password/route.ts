import { API, readJson, route, upstream } from '@/shared/server';

export const POST = route(
    async (request) => {
        const body = await readJson(request);
        return upstream.post(API.users.changePassword.resolve(), body, { cache: 'no-store' });
    },
    { errorMessage: 'Failed to change password', errorStatus: 503 }
);
