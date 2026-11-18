import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.admin.users.stats.resolve(),
    tags: ['admin', 'users', 'stats'],
    errorMessage: 'Failed to fetch user statistics',
    errorStatus: 503,
});
