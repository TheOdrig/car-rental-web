const API_BASE = '/api';
const FILE_ROOT = `${API_BASE}/v1/files/`;
const LEGACY_UPLOADS = /^\/?uploads\/(avatars|damage-photos)\/([^/?#]+)$/;
export const FILE_PROXY_ROOT = `${API_BASE}/files/`;

export function toFileProxyUrl(url: string | null | undefined): string | undefined {
    const value = url?.trim();
    if (!value) {
        return undefined;
    }

    const legacy = LEGACY_UPLOADS.exec(value);
    if (legacy) {
        return `${FILE_PROXY_ROOT}${legacy[1]}/${legacy[2]}`;
    }

    if (value.startsWith(FILE_PROXY_ROOT)) {
        return value;
    }

    if (value.startsWith(FILE_ROOT)) {
        return `${FILE_PROXY_ROOT}${value.slice(FILE_ROOT.length)}`;
    }

    try {
        const parsed = new URL(value);
        if (parsed.pathname.startsWith(FILE_ROOT)) {
            return `${FILE_PROXY_ROOT}${parsed.pathname.slice(FILE_ROOT.length)}${parsed.search}`;
        }
    } catch {
        return value;
    }

    return value;
}

export function isSafeFilePath(segments: string[]): boolean {
    return (
        segments.length > 0 &&
        segments.every(
            (segment) =>
                segment.length > 0 &&
                segment !== '.' &&
                segment !== '..' &&
                !/[\\/\0]/.test(segment) &&
                !segment.includes('%')
        )
    );
}
