'use client';

import { useSessionKeeper } from '../api/use-auth';

export function SessionKeeper() {
    useSessionKeeper();
    return null;
}
