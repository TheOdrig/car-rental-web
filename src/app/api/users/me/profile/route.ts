import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.users.profile.resolve(),
    errorMessage: 'Failed to fetch profile',
    errorStatus: 503,
});

export const PUT = proxy({
    target: () => API.users.updateProfile.resolve(),
    errorMessage: 'Failed to update profile',
    errorStatus: 503,
});
