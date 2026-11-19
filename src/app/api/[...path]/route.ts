import { ApiError } from '@/shared/api';
import { route } from '@/shared/server';

const notFound = route<{ path: string[] }>(
    async () => {
        throw new ApiError(404, 'Resource not found');
    },
    { errorMessage: 'Resource not found' }
);

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
