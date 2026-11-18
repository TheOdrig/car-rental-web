import { CAR_ENDPOINTS } from '@/entities/car';
import { parseIdParam, proxy, readJson, route, upstream } from '@/shared/server';
import { toBackendCar, type CarFormBody } from '../_lib/to-backend-car';

export const GET = proxy<{ id: string }>({
    path: ({ id }) => CAR_ENDPOINTS.admin.byId(parseIdParam(id, 'car ID')),
    errorMessage: 'Failed to fetch car',
});

export const POST = route<{ id: string }>(
    async (request, { id }) => {
        const carId = parseIdParam(id, 'car ID');
        const body = await readJson<CarFormBody>(request);
        return upstream.put(CAR_ENDPOINTS.admin.update(carId), toBackendCar(body, undefined), {
            cache: 'no-store',
        });
    },
    { errorMessage: 'Failed to update car' }
);

export const DELETE = route<{ id: string }>(
    async (_request, { id }) => {
        await upstream.delete(CAR_ENDPOINTS.admin.delete(parseIdParam(id, 'car ID')), { cache: 'no-store' });
        return { success: true };
    },
    { errorMessage: 'Failed to delete car' }
);
