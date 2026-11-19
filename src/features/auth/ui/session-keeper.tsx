'use client';

import { useSessionKeeper } from '../lib/use-auth';

export function SessionKeeper() {
    useSessionKeeper();
    return null;
}
