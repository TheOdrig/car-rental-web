'use client';

import Image, { ImageProps } from 'next/image';

const ALLOWED_HOSTNAMES = [
    'images.unsplash.com',
    'plus.unsplash.com',
    'lh3.googleusercontent.com',
    'placehold.co',
    'www.thedrive.com',
    'www.sixt.com.tr',
    'www.log.com.tr',
    'cdn3.focus.bg',
    'tr.semautomobile.com',
];

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
    const srcString = typeof src === 'string' ? src : '';
    const shouldOptimize = isAllowedHostname(srcString);

    return (
        <Image
            src={src}
            alt={alt}
            unoptimized={!shouldOptimize}
            {...props}
        />
    );
}
