import { API, proxy } from '@/shared/server';

export const GET = proxy({
    target: () => API.damages.me.resolve(),
    forwardQuery: true,
    errorMessage: 'Failed to fetch damages',
});
