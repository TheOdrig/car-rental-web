'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { Car } from 'lucide-react';
import { FILE_PROXY_ROOT, toFileProxyUrl } from '@/shared/lib/file-url';
import { cn } from '@/shared/lib';

const ALLOWED_HOSTNAMES = ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'];

export const IMAGE_PLACEHOLDER_SRC = '/images/car-placeholder.svg';

export function isAllowedHostname(src: string): boolean {
    if (!src || typeof src !== 'string') return false;
    if (src.startsWith(FILE_PROXY_ROOT)) return false;
    try {
        const url = new URL(src);
        return ALLOWED_HOSTNAMES.includes(url.hostname);
    } catch {
        return true;
    }
}

function ImagePlaceholder({ alt, fill, width, height, className }: Pick<ImageProps, 'alt' | 'fill' | 'width' | 'height' | 'className'>) {
    return (
        <div
            role="img"
            aria-label={alt}
            data-testid="image-placeholder"
            className={cn(
                'flex items-center justify-center bg-muted text-muted-foreground/50',
                fill && 'absolute inset-0',
                className
            )}
            style={fill ? undefined : { width, height }}
        >
            <Car className="h-1/3 w-1/3 min-h-4 min-w-4 max-h-16 max-w-16" strokeWidth={1.5} aria-hidden="true" />
        </div>
    );
}

export function DynamicImage({ src, alt, onError, ...props }: ImageProps) {
    const [failedSrc, setFailedSrc] = useState<unknown>(null);
    const proxied = typeof src === 'string' ? (toFileProxyUrl(src) ?? src) : src;
    const srcString = typeof proxied === 'string' ? proxied : '';
    const shouldOptimize = isAllowedHostname(srcString);

    if (srcString === IMAGE_PLACEHOLDER_SRC || failedSrc === proxied) {
        return (
            <ImagePlaceholder
                alt={alt}
                fill={props.fill}
                width={props.width}
                height={props.height}
                className={props.className}
            />
        );
    }

    return (
        <Image
            src={proxied}
            alt={alt}
            unoptimized={!shouldOptimize}
            onError={(event) => {
                setFailedSrc(proxied);
                onError?.(event);
            }}
            {...props}
        />
    );
}
