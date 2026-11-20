import { NextResponse } from 'next/server';
import { ApiError, isApiError } from '@/shared/api';
import { isSafeFilePath } from '@/shared/lib/file-url';
import { API, route, upstreamResponse } from '@/shared/server';

export const dynamic = 'force-dynamic';

const FORWARDED_HEADERS = ['content-type', 'content-length', 'content-disposition', 'etag', 'last-modified'];
const PRIVATE_CACHE = 'private, max-age=300';

const TARGETS = {
    avatars: (filename: string) => API.files.avatar.resolve({ filename }),
    'damage-photos': (filename: string) => API.files.damagePhoto.resolve({ filename }),
} as const;

function targetFor(directory: string, filename: string) {
    if (!isSafeFilePath([directory, filename]) || !Object.hasOwn(TARGETS, directory)) {
        throw new ApiError(400, 'Invalid file path');
    }

    return TARGETS[directory as keyof typeof TARGETS](filename);
}

export const GET = route<{ directory: string; filename: string }>(
    async (_request, { directory, filename }) => {
        const upstream = await upstreamResponse(targetFor(directory, filename), { cache: 'no-store' }).catch((error: unknown) => {
            if (isApiError(error) && error.status === 404) {
                const missing = new ApiError(404, 'The file does not exist');
                missing.code = 'FILE_NOT_FOUND';
                missing.title = 'File not found';
                throw missing;
            }
            throw error;
        });

        const headers = new Headers();
        for (const name of FORWARDED_HEADERS) {
            const value = upstream.headers.get(name);
            if (value) {
                headers.set(name, value);
            }
        }
        headers.set('Cache-Control', PRIVATE_CACHE);
        headers.set('Content-Security-Policy', "default-src 'none'; sandbox");
        headers.set('X-Content-Type-Options', 'nosniff');

        return new NextResponse(upstream.body, { status: 200, headers });
    },
    { errorMessage: 'Failed to load file' }
);
