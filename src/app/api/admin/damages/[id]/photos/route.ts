import { DAMAGE_ENDPOINTS } from '@/entities/damage';
import { ApiError } from '@/shared/api';
import { created, parseIdParam, route, searchParamsOf, upstream } from '@/shared/server';

export const POST = route<{ id: string }>(
    async (request, { id }) => {
        const damageId = parseIdParam(id, 'damage ID');
        const formData = await request.formData();
        const data = await upstream.post(DAMAGE_ENDPOINTS.admin.photos(damageId), formData, {
            cache: 'no-store',
        });
        return created(data);
    },
    { errorMessage: 'Failed to upload photos' }
);

export const DELETE = route<{ id: string }>(
    async (request, { id }) => {
        const damageId = parseIdParam(id, 'damage ID');
        const photoId = searchParamsOf(request).get('photoId');

        if (!photoId) {
            throw new ApiError(400, 'photoId is required');
        }

        await upstream.delete(DAMAGE_ENDPOINTS.admin.deletePhoto(damageId, parseIdParam(photoId, 'photo ID')), {
            cache: 'no-store',
        });
        return { success: true };
    },
    { errorMessage: 'Failed to delete photo' }
);
