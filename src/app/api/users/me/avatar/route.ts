import { USER_ENDPOINTS, type AvatarUploadResponse } from '@/entities/user';
import { route, upstream } from '@/shared/server';

export const dynamic = 'force-dynamic';

export const POST = route(
    async (request) => {
        const formData = await request.formData();
        return upstream.post<AvatarUploadResponse>(USER_ENDPOINTS.avatar, formData, { cache: 'no-store' });
    },
    { errorMessage: 'Failed to upload avatar' }
);

export const DELETE = route(
    async () => upstream.delete<AvatarUploadResponse>(USER_ENDPOINTS.avatar, { cache: 'no-store' }),
    { errorMessage: 'Failed to delete avatar' }
);
