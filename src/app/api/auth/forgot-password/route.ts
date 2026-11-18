import { API, proxy } from '@/shared/server';

export const POST = proxy({
    target: () => API.auth.forgotPassword.resolve(),
    anonymous: true,
    errorMessage: 'Failed to send password reset email',
    errorStatus: 503,
});
