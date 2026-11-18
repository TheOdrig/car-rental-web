import { DAMAGE_ENDPOINTS } from '@/entities/damage';
import { ApiError } from '@/shared/api';
import { created, proxy, readJson, route, searchParamsOf, upstream } from '@/shared/server';

export const GET = proxy({
    path: () => DAMAGE_ENDPOINTS.admin.search,
    forwardQuery: true,
    errorMessage: 'Failed to fetch damages',
});

export const POST = route(
    async (request) => {
        const rentalId = searchParamsOf(request).get('rentalId');

        if (!rentalId) {
            throw new ApiError(400, 'rentalId is required');
        }

        const body = await readJson(request);
        const data = await upstream.post(DAMAGE_ENDPOINTS.admin.list, body, {
            params: { rentalId },
            cache: 'no-store',
        });
        return created(data);
    },
    { errorMessage: 'Failed to create damage report' }
);
