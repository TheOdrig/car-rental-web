import { CAR_ENDPOINTS, type AvailabilitySearchRequest, type AvailabilitySearchResponse } from '@/entities/car';
import { ApiError } from '@/shared/api';
import { readJson, route, upstream } from '@/shared/server';

export const POST = route(
    async (request) => {
        const body = await readJson<AvailabilitySearchRequest>(request);

        if (!body.startDate || !body.endDate) {
            throw new ApiError(400, 'Start date and end date are required');
        }

        const start = new Date(body.startDate);
        const end = new Date(body.endDate);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            throw new ApiError(400, 'Start date and end date must be valid dates');
        }

        if (start >= end) {
            throw new ApiError(400, 'End date must be after start date');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            throw new ApiError(400, 'Start date cannot be in the past');
        }

        return upstream.post<AvailabilitySearchResponse>(CAR_ENDPOINTS.availability.search, body, {
            cache: 'no-store',
        });
    },
    { errorMessage: 'Failed to search cars' }
);
