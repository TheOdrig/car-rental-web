import { proxy } from '@/shared/server';
import { AUTH_ENDPOINTS } from '@/features/auth';

export const POST = proxy({
    path: () => AUTH_ENDPOINTS.forgotPassword,
    method: 'POST',
    anonymous: true,
    errorMessage: 'Failed to send password reset email',
    errorStatus: 503,
});
