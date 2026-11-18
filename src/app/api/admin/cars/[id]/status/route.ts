import { ApiError } from '@/shared/api';
import { API, parseIdParam, readJson, route, upstream } from '@/shared/server';

interface StatusBody {
    status?: string;
    reason?: string;
    notes?: string;
}

export const POST = route<{ id: string }>(
    async (request, { id }) => {
        const carId = parseIdParam(id, 'car ID');
        const body = await readJson<StatusBody>(request);

        if (!body.status) {
            throw new ApiError(400, 'status is required');
        }

        const carStatusType = body.status.charAt(0).toUpperCase() + body.status.slice(1).toLowerCase();

        return upstream.patch(
            API.cars.updateStatus.resolve({ id: carId }),
            {
                carStatusType,
                reason: body.reason || 'Status updated from admin panel',
                notes: body.notes,
            },
            { cache: 'no-store' }
        );
    },
    { errorMessage: 'Failed to update car status' }
);
