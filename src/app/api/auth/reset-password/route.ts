import { ApiError, isApiError } from '@/shared/api';
import { describeResetLinkError } from '@/features/auth/lib/reset-errors';
import { API, readJson, route, upstream } from '@/shared/server';

function mapResetError(error: ApiError): ApiError {
    const described = describeResetLinkError(error.message);

    return described ? new ApiError(400, described.detail) : error;
}

export const POST = route(
    async (request) => {
        const body = await readJson(request);

        try {
            return await upstream.post(API.auth.resetPassword.resolve(), body, { anonymous: true, cache: 'no-store' });
        } catch (error) {
            throw isApiError(error) ? mapResetError(error) : error;
        }
    },
    { errorMessage: 'Failed to reset password', errorStatus: 503 }
);
