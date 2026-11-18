import { AUTH_ENDPOINTS } from '@/features/auth';
import { readJson, route, signIn } from '@/shared/server';

export const POST = route(
    async (request) => signIn(AUTH_ENDPOINTS.login, await readJson(request)),
    { errorMessage: 'Internal server error' }
);
