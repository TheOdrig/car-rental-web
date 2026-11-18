import { proxy } from '@/shared/server';
import { USER_ENDPOINTS } from '@/entities/user';

export const GET = proxy({
    path: () => USER_ENDPOINTS.profile,
    errorMessage: 'Failed to fetch profile',
    errorStatus: 503,
});

export const PUT = proxy({
    path: () => USER_ENDPOINTS.profile,
    method: 'PUT',
    errorMessage: 'Failed to update profile',
    errorStatus: 503,
});
