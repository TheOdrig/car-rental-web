import { API, readJson, route, signIn } from '@/shared/server';

export const POST = route(
    async (request) => signIn(API.auth.register.resolve(), await readJson(request)),
    { errorMessage: 'Internal server error' }
);
