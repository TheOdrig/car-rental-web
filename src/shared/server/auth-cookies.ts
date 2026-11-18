import 'server-only';
import { cookies } from 'next/headers';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const DEFAULT_ACCESS_MAX_AGE_SECONDS = 900;

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
}

export interface AuthCookieOptions {
    httpOnly: true;
    secure: boolean;
    sameSite: 'lax';
    path: '/';
    maxAge: number;
}

export function resolveAccessMaxAge(expiresIn: number | undefined): number {
    if (expiresIn === undefined || !Number.isFinite(expiresIn)) {
        return DEFAULT_ACCESS_MAX_AGE_SECONDS;
    }

    const seconds = Math.floor(expiresIn);
    return seconds > 0 ? seconds : DEFAULT_ACCESS_MAX_AGE_SECONDS;
}

function baseOptions(maxAge: number): AuthCookieOptions {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge,
    };
}

export function buildAuthCookies(tokens: AuthTokens): Array<{ name: string; value: string; options: AuthCookieOptions }> {
    return [
        {
            name: ACCESS_COOKIE,
            value: tokens.accessToken,
            options: baseOptions(resolveAccessMaxAge(tokens.expiresIn)),
        },
        {
            name: REFRESH_COOKIE,
            value: tokens.refreshToken,
            options: baseOptions(REFRESH_MAX_AGE_SECONDS),
        },
    ];
}

export async function getAccessToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_COOKIE)?.value;
}

export async function setAuthTokens(tokens: AuthTokens): Promise<void> {
    const cookieStore = await cookies();
    for (const { name, value, options } of buildAuthCookies(tokens)) {
        cookieStore.set(name, value, options);
    }
}

export async function clearAuthTokens(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_COOKIE);
    cookieStore.delete(REFRESH_COOKIE);
}

export function mergeCookieHeader(
    header: string | null | undefined,
    replacements: Array<{ name: string; value: string }>
): string {
    const replaced = new Set(replacements.map(({ name }) => name));
    const kept = (header ?? '')
        .split(';')
        .map((part) => part.trim())
        .filter((part) => part.length > 0 && !replaced.has(part.split('=')[0]));

    return [...kept, ...replacements.map(({ name, value }) => `${name}=${value}`)].join('; ');
}
