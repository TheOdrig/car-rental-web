'use server';

import { cookies } from 'next/headers';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
};

export async function getAccessToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_KEY)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_TOKEN_KEY)?.value;
}

export async function setAuthTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number
): Promise<void> {
    const cookieStore = await cookies();

    const now = Date.now();
    let accessMaxAge: number;

    if (expiresIn > 1000000000000) {
        accessMaxAge = Math.floor((expiresIn - now) / 1000);
    } else if (expiresIn > 1000000000) {
        accessMaxAge = Math.floor(expiresIn - (now / 1000));
    } else {
        accessMaxAge = expiresIn;
    }

    if (accessMaxAge <= 0) {
        console.warn('[Auth] Invalid expiresIn value, defaulting to 15 minutes');
        accessMaxAge = 900;
    }

    const refreshMaxAge = 60 * 60 * 24 * 7;

    cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: accessMaxAge,
    });

    cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: refreshMaxAge,
    });
}

export async function clearAuthTokens(): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.delete(ACCESS_TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
}

export async function isAuthenticated(): Promise<boolean> {
    const token = await getAccessToken();
    return !!token;
}
