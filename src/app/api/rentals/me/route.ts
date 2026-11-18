import { proxy } from '@/shared/server';
import { RENTAL_ENDPOINTS } from '@/entities/rental';

export const GET = proxy({
    path: () => RENTAL_ENDPOINTS.me,
    forwardQuery: true,
    tags: ['rentals', 'my-rentals'],
    errorMessage: 'Failed to fetch rentals',
    errorStatus: 503,
});
