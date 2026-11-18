import { ApiError } from '@/shared/api';
import { API, created, proxy, readJson, route, searchParamsOf, upstream } from '@/shared/server';

export const GET = proxy({
    target: () => API.admin.damages.search.resolve(),
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
        const data = await upstream.post(API.admin.damages.create.resolve(), body, {
            params: { rentalId },
            cache: 'no-store',
        });
        return created(data);
    },
    { errorMessage: 'Failed to create damage report' }
);
