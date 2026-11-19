'use client';

import Image, { ImageProps } from 'next/image';
import { toFileProxyUrl } from '@/shared/lib/file-url';

const ALLOWED_HOSTNAMES = ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'];

function isAllowedHostname(src: string): boolean {
    if (!src || typeof src !== 'string') return false;
    try {
        const url = new URL(src);
        return ALLOWED_HOSTNAMES.includes(url.hostname);
    } catch {
        return true;
    }
}

export function DynamicImage({ src, alt, ...props }: ImageProps) {
    const proxied = typeof src === 'string' ? (toFileProxyUrl(src) ?? src) : src;
    const srcString = typeof proxied === 'string' ? proxied : '';
    const shouldOptimize = isAllowedHostname(srcString);

    return (
        <Image
            src={proxied}
            alt={alt}
            unoptimized={!shouldOptimize}
            {...props}
        />
    );
}