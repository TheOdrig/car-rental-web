import { API, proxy } from '@/shared/server';
import { mapLateReturnPage } from '../_lib/late-return-status';

export const GET = proxy({
    target: () => API.admin.lateReturns.resolve(),
    forwardQuery: true,
    respond: mapLateReturnPage,
    errorMessage: 'Failed to fetch late returns',
    errorStatus: 503,
});
