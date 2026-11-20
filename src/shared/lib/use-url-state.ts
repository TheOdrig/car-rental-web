'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyUrlPatch, urlStateHref, type UrlStatePatch } from './url-state';

export interface UrlStateOptions {
    path?: string;
    mode?: 'push' | 'replace';
    scroll?: boolean;
}

export function useUrlState() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const get = useCallback((key: string) => searchParams?.get(key) ?? null, [searchParams]);

    const update = useCallback(
        (patch: UrlStatePatch, options: UrlStateOptions = {}) => {
            const href = urlStateHref(applyUrlPatch(searchParams, patch), options.path);
            const navigate = options.mode === 'replace' ? router.replace : router.push;
            if (options.scroll === undefined) navigate(href);
            else navigate(href, { scroll: options.scroll });
        },
        [router, searchParams],
    );

    const clear = useCallback(() => router.push('?'), [router]);

    return { searchParams, get, update, clear };
}
