import { withQuery } from './url';

export type UrlStatePatch = Record<string, string | number | null | undefined>;

export function applyUrlPatch(current: URLSearchParams | string | null | undefined, patch: UrlStatePatch): string {
    const params = new URLSearchParams(current?.toString() ?? '');
    for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined || value === '') params.delete(key);
        else params.set(key, String(value));
    }
    return params.toString();
}

export function urlStateHref(query: string, path?: string): string {
    return path === undefined ? `?${query}` : withQuery(path, query);
}
