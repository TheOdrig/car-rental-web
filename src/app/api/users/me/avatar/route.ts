import { type AvatarUploadResponse } from '@/entities/user';
import { API, route, upstream } from '@/shared/server';

export const dynamic = 'force-dynamic';

export const POST = route(
    async (request) => {
        const formData = await request.formData();
        return upstream.post<AvatarUploadResponse>(API.users.uploadAvatar.resolve(), formData, { cache: 'no-store' });
    },
    { errorMessage: 'Failed to upload avatar', contentTypes: ['multipart/form-data'] }
);

export const DELETE = route(
    async () => upstream.delete<AvatarUploadResponse>(API.users.deleteAvatar.resolve(), { cache: 'no-store' }),
    { errorMessage: 'Failed to delete avatar' }
);
