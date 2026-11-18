import { ApiError, isApiError } from '@/shared/api';
import { API, readJson, route, upstream } from '@/shared/server';

function isWrongPasswordMessage(message: string): boolean {
    const lower = message.toLowerCase();
    return lower.includes('current password') || lower.includes('incorrect') || lower.includes('invalid password');
}

export const POST = route(
    async (request) => {
        const body = await readJson(request);

        try {
            return await upstream.post(API.users.changePassword.resolve(), body, { cache: 'no-store' });
        } catch (error) {
            if (isApiError(error) && isWrongPasswordMessage(error.message)) {
                throw new ApiError(400, 'Current password is incorrect');
            }
            throw error;
        }
    },
    { errorMessage: 'Failed to change password', errorStatus: 503 }
);
