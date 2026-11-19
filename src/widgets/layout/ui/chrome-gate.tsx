'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { isChromelessRoute } from '@/shared/config/route-access';

export function HideOnAuthRoutes({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    if (isChromelessRoute(pathname)) return null;
    return <>{children}</>;
}
