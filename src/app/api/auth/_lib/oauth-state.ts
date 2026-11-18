import { timingSafeEqual } from 'node:crypto';
import type { NextResponse } from 'next/server';

export const OAUTH_STATE_COOKIE = 'oauth_state';

const OAUTH_STATE_MAX_AGE_SECONDS = 600;
const OAUTH_STATE_PATH = '/api/auth';

export function setOAuthStateCookie(response: NextResponse, state: string): void {
    response.cookies.set(OAUTH_STATE_COOKIE, state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: OAUTH_STATE_PATH,
        maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
    });
}

export function clearOAuthStateCookie(response: NextResponse): void {
    response.cookies.set(OAUTH_STATE_COOKIE, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: OAUTH_STATE_PATH,
        maxAge: 0,
    });
}

export function oauthStateMatches(expected: string | undefined, actual: string): boolean {
    if (!expected) {
        return false;
    }

    const left = Buffer.from(expected);
    const right = Buffer.from(actual);

    return left.length === right.length && timingSafeEqual(left, right);
}
