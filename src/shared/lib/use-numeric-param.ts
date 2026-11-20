'use client';

import { useMemo } from 'react';
import { parseNumericId } from './numeric-id';

export function useNumericParam(raw: string | string[] | undefined | null): number {
    const key = Array.isArray(raw) ? raw[0] : raw;
    return useMemo(() => parseNumericId(key), [key]);
}
