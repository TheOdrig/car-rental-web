'use client';

import type { ReactNode, Ref } from 'react';
import { cn } from '@/shared/lib';

type PageArea = 'public' | 'customer' | 'admin';

interface PageHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    breadcrumb?: ReactNode;
    area?: PageArea;
    size?: 'page' | 'detail';
    surface?: boolean;
    headingRef?: Ref<HTMLHeadingElement>;
    focusable?: boolean;
    className?: string;
}

const TITLE_SIZE = {
    page: 'text-3xl',
    detail: 'text-2xl',
} as const;

const DESCRIPTION_SIZE: Record<PageArea, string> = {
    admin: 'text-sm',
    customer: 'text-base',
    public: 'text-base',
};

export function PageHeader({
    title,
    description,
    actions,
    breadcrumb,
    area = 'admin',
    size = 'page',
    surface = false,
    headingRef,
    focusable = false,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn(breadcrumb && 'space-y-6', className)}>
            {breadcrumb}
            <div
                className={cn(
                    'flex flex-col justify-between gap-4 sm:flex-row sm:items-center',
                    surface && 'gap-6 rounded-lg border border-border bg-card p-6 shadow-sm'
                )}
            >
                <div className="min-w-0 space-y-1">
                    <h1
                        ref={headingRef}
                        tabIndex={focusable ? -1 : undefined}
                        className={cn(
                            'min-w-0 break-words font-bold tracking-tight text-foreground',
                            TITLE_SIZE[size],
                            focusable && 'focus:outline-none'
                        )}
                    >
                        {title}
                    </h1>
                    {description && (
                        <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground', DESCRIPTION_SIZE[area])}>
                            {description}
                        </div>
                    )}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
            </div>
        </div>
    );
}
