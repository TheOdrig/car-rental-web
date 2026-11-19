import { API, parseIdParam, route, upstream } from '@/shared/server';

export const POST = route<{ id: string }>(
    async (_request, { id }) => {
        return upstream.post(API.cars.restore.resolve({ id: parseIdParam(id, 'car ID') }), undefined, {
            cache: 'no-store',
        });
    },
    { errorMessage: 'Failed to restore car' }
);
