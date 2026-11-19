import { API, parseIdParam, proxy, readJson, route, upstream } from '@/shared/server';
import { carUpdateRequest, type CarFormBody } from '../_lib/to-backend-car';

export const GET = proxy<{ id: string }>({
    target: ({ id }) => API.cars.byId.resolve({ id: parseIdParam(id, 'car ID') }),
    errorMessage: 'Failed to fetch car',
});

export const POST = route<{ id: string }>(
    async (request, { id }) => {
        const carId = parseIdParam(id, 'car ID');
        const body = await readJson<CarFormBody>(request);
        const current = await upstream.get<Record<string, unknown>>(API.cars.byId.resolve({ id: carId }), {
            cache: 'no-store',
        });
        return upstream.put(API.cars.update.resolve({ id: carId }), carUpdateRequest(current, body), {
            cache: 'no-store',
        });
    },
    { errorMessage: 'Failed to update car' }
);

export const DELETE = route<{ id: string }>(
    async (_request, { id }) => {
        await upstream.delete(API.cars.softDelete.resolve({ id: parseIdParam(id, 'car ID') }), { cache: 'no-store' });
        return { success: true };
    },
    { errorMessage: 'Failed to delete car' }
);
