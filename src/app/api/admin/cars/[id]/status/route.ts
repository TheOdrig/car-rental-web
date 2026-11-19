import { ApiError } from '@/shared/api';
import { CAR_STATUSES, type CarStatus } from '@/entities/car';
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

        const carStatusType = body.status.toUpperCase();
        if (!CAR_STATUSES.includes(carStatusType as CarStatus)) {
            throw new ApiError(400, 'Unknown car status');
        }

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
