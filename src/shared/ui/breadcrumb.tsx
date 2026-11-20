'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className={cn('flex min-w-0 items-center text-sm text-muted-foreground', className)}
        >
            <ol className="flex min-w-0 flex-wrap items-center gap-1.5">
                <li>
                    <Link
                        href={ROUTES.home}
                        className="-ml-3 flex min-h-11 min-w-11 items-center justify-center gap-1 hover:text-foreground transition-colors md:ml-0 md:min-h-0 md:min-w-0"
                        aria-label="Home"
                    >
                        <Home className="h-4 w-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="flex min-w-0 items-center gap-1.5 [overflow-wrap:anywhere]">
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            {isLast || !item.href ? (
                                <span
                                    className={cn(
                                        isLast && 'text-foreground font-medium'
                                    )}
                                    aria-current={isLast ? 'page' : undefined}
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="inline-flex min-h-11 items-center hover:text-foreground transition-colors md:min-h-0"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}