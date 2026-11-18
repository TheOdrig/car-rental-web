import 'server-only';
import { ApiError } from '@/shared/api/error';
import { getAccessToken, setAuthTokens } from './auth-cookies';
import { verifyAccessToken, type Session } from './session';
import { authResponseSchema, upstream, type UpstreamPath } from './upstream';

export async function signIn(path: UpstreamPath<'POST'>, credentials: unknown): Promise<{ username?: string; tokenType?: string }> {
    const data = await upstream.post<unknown>(path, credentials, { anonymous: true, cache: 'no-store' });
    const parsed = authResponseSchema.safeParse(data);

    if (!parsed.success) {
        throw new ApiError(502, 'Unexpected response from the authentication service');
    }

    await setAuthTokens(parsed.data);

    return { username: parsed.data.username, tokenType: parsed.data.tokenType };
}

export async function getSession(): Promise<Session | null> {
    return verifyAccessToken(await getAccessToken());
}
