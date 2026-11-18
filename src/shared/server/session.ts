import 'server-only';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import { getServerEnv } from './env';

const ADMIN_ROLE = 'ADMIN';

const claimsSchema = z.object({
    sub: z.string().min(1),
    token_use: z.literal('access'),
    userId: z.number(),
    roles: z.array(z.string()),
    exp: z.number(),
});

export interface Session {
    userId: number;
    username: string;
    roles: string[];
    exp: number;
}

export async function verifyAccessToken(token: string | undefined): Promise<Session | null> {
    if (!token) {
        return null;
    }

    const secret = new TextEncoder().encode(getServerEnv().JWT_SECRET);

    try {
        const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
        const claims = claimsSchema.safeParse(payload);

        if (!claims.success) {
            return null;
        }

        return {
            userId: claims.data.userId,
            username: claims.data.sub,
            roles: claims.data.roles,
            exp: claims.data.exp,
        };
    } catch {
        return null;
    }
}

export function isAdminSession(session: Session | null): session is Session {
    return session?.roles.includes(ADMIN_ROLE) ?? false;
}
