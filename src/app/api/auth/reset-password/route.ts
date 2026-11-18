import { ApiError, isApiError } from '@/shared/api';
import { API, readJson, route, upstream } from '@/shared/server';

function mapResetError(error: ApiError): ApiError {
    const message = error.message.toLowerCase();

    if (message.includes('expired')) {
        return new ApiError(400, 'This password reset link has expired. Please request a new one.');
    }

    if (message.includes('invalid') || message.includes('used')) {
        return new ApiError(400, 'This password reset link is invalid or has already been used.');
    }

    return error;
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
