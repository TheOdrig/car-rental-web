import { API, created, proxy, readJson, route, upstream } from '@/shared/server';
import { carCreateRequest, type CarFormBody } from './_lib/to-backend-car';

export const GET = proxy({
    target: () => API.admin.cars.search.resolve(),
    forwardQuery: true,
    errorMessage: 'Failed to fetch cars',
});

export const POST = route(
    async (request) => {
        const body = await readJson<CarFormBody>(request);
        const data = await upstream.post(API.cars.create.resolve(), carCreateRequest(body), {
            cache: 'no-store',
        });
        return created(data);
    },
    { errorMessage: 'Failed to create car' }
);
