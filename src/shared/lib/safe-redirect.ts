import { ROUTES } from '@/shared/config/routes';

const FALLBACK_PATH = ROUTES.home;
const PROBE_ORIGIN = 'http://redirect.invalid';
const BACKSLASH = String.fromCharCode(92);

function hasControlCharacter(value: string): boolean {
    return [...value].some((char) => char.charCodeAt(0) < 0x20 || char.charCodeAt(0) === 0x7f);
}

export function safeRedirectPath(value: unknown, fallback: string = FALLBACK_PATH): string {
    if (
        typeof value !== 'string' ||
        !value.startsWith('/') ||
        value.startsWith('//') ||
        value.startsWith(`/${BACKSLASH}`) ||
        hasControlCharacter(value)
    ) {
        return fallback;
    }

    try {
        const parsed = new URL(value, PROBE_ORIGIN);
        if (parsed.origin !== PROBE_ORIGIN) {
            return fallback;
        }
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
        return fallback;
    }
}
