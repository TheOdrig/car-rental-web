'use client';

import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

type SwitchAt = 'md' | 'lg';

interface ResponsiveDataViewProps {
    mobile: ReactNode;
    desktop: ReactNode;
    switchAt?: SwitchAt;
    className?: string;
}

const MOBILE_CLASSES: Record<SwitchAt, string> = {
    md: 'md:hidden',
    lg: 'lg:hidden',
};

const DESKTOP_CLASSES: Record<SwitchAt, string> = {
    md: 'hidden md:block',
    lg: 'hidden lg:block',
};

export function ResponsiveDataView({ mobile, desktop, switchAt = 'md', className }: ResponsiveDataViewProps) {
    return (
        <div className={className}>
            <div className={cn(MOBILE_CLASSES[switchAt])} data-slot="responsive-data-view-mobile">
                {mobile}
            </div>
            <div className={cn(DESKTOP_CLASSES[switchAt])} data-slot="responsive-data-view-desktop">
                {desktop}
            </div>
        </div>
    );
}
