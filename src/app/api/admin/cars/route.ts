import { CAR_ENDPOINTS } from '@/entities/car';
import { created, proxy, readJson, route, upstream } from '@/shared/server';
import { DEFAULT_CAR_IMAGE, toBackendCar, type CarFormBody } from './_lib/to-backend-car';

export const GET = proxy({
    path: () => CAR_ENDPOINTS.admin.list,
    forwardQuery: true,
    errorMessage: 'Failed to fetch cars',
});

export const POST = route(
    async (request) => {
        const body = await readJson<CarFormBody>(request);
        const data = await upstream.post(CAR_ENDPOINTS.admin.create, toBackendCar(body, DEFAULT_CAR_IMAGE), {
            cache: 'no-store',
        });
        return created(data);
    },
    { errorMessage: 'Failed to create car' }
);
