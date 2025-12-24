'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            className={cn('flex items-center text-sm text-muted-foreground', className)}
        >
            <ol className="flex items-center gap-1.5">
                <li>
                    <Link
                        href="/"
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                        aria-label="Home"
                    >
                        <Home className="h-4 w-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="flex items-center gap-1.5">
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
                                    className="hover:text-foreground transition-colors"
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
