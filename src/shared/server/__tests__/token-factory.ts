import { SignJWT } from 'jose';

export const TEST_JWT_SECRET = 'test-jwt-secret-with-at-least-32-chars!!';

interface TokenOptions {
    roles?: string[];
    secret?: string;
    expiresIn?: string;
    userId?: number;
    omit?: 'roles' | 'userId' | 'token_use';
    tokenUse?: string;
}

export async function createToken(options: TokenOptions = {}): Promise<string> {
    const { roles = ['USER'], secret = TEST_JWT_SECRET, expiresIn = '15m', userId = 7, omit, tokenUse = 'access' } = options;
    const claims: Record<string, unknown> = { userId, roles, token_use: tokenUse };

    if (omit) {
        delete claims[omit];
    }

    return new SignJWT(claims)
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject('alice')
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(new TextEncoder().encode(secret));
}
