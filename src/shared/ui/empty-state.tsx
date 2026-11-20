'use client';

import { type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    FileQuestion,
    Search,
    ShoppingCart,
    Users,
    Car,
    Calendar,
    ExternalLink,
    HelpCircle,
    BookOpen,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui/button';

type EmptyStateType = 'default' | 'search' | 'cart' | 'users' | 'cars' | 'rentals';

interface HelpLink {
    label: string;
    href: string;
    icon?: LucideIcon;
    external?: boolean;
}

interface EmptyStateProps {
    type?: EmptyStateType;
    icon?: LucideIcon;
    size?: 'default' | 'compact';
    title: string;
    description?: string;
    illustration?: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    helpLinks?: HelpLink[];
    className?: string;
    children?: ReactNode;
}

const iconMap: Record<EmptyStateType, LucideIcon> = {
    default: FileQuestion,
    search: Search,
    cart: ShoppingCart,
    users: Users,
    cars: Car,
    rentals: Calendar,
};

export function EmptyState({
    type = 'default',
    icon,
    size = 'default',
    title,
    description,
    illustration,
    action,
    helpLinks,
    className,
    children,
}: EmptyStateProps) {
    const Icon = icon ?? iconMap[type];
    const compact = size === 'compact';

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center px-4 text-center',
                compact ? 'py-8' : 'py-12',
                className
            )}
        >
            {illustration ? (
                <div className="relative mb-6 h-40 w-40">
                    <Image
                        src={illustration}
                        alt=""
                        fill
                        sizes="160px"
                        className="object-contain"
                    />
                </div>
            ) : (
                <div
                    className={cn(
                        'mb-4 flex items-center justify-center rounded-full bg-muted',
                        compact ? 'h-12 w-12' : 'h-16 w-16'
                    )}
                >
                    <Icon className={cn('text-muted-foreground', compact ? 'h-6 w-6' : 'h-8 w-8')} aria-hidden="true" />
                </div>
            )}

            <h3 className={cn("font-semibold", compact ? "text-base" : "text-lg")}>{title}</h3>

            {description && (
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    {description}
                </p>
            )}

            {action && (
                <div className="mt-6">
                    {action.href ? (
                        <Button asChild>
                            <Link href={action.href}>{action.label}</Link>
                        </Button>
                    ) : (
                        <Button onClick={action.onClick}>{action.label}</Button>
                    )}
                </div>
            )}

            {helpLinks && helpLinks.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                    {helpLinks.map((link) => {
                        const LinkIcon = link.icon || HelpCircle;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                {...(link.external && {
                                    target: '_blank',
                                    rel: 'noopener noreferrer',
                                })}
                            >
                                <LinkIcon className="h-4 w-4" />
                                {link.label}
                                {link.external && (
                                    <ExternalLink className="h-3 w-3" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}

            {children && <div className="mt-6">{children}</div>}
        </div>
    );
}

export const EMPTY_STATE_PRESETS = {
    noRentals: {
        type: 'rentals' as const,
        title: 'No rentals yet',
        description: "You haven't made any rental requests. Browse our cars and book your first rental!",
        illustration: '/images/empty-rentals.svg',
        action: {
            label: 'Browse Cars',
            href: '/cars',
        },
        helpLinks: [
            { label: 'How to Book', href: '/help/booking', icon: BookOpen },
            { label: 'FAQ', href: '/help/faq', icon: HelpCircle },
        ],
    },
    noActiveRentals: {
        type: 'rentals' as const,
        title: 'No active trips',
        description: "You don't have any active rentals at the moment.",
    },
    noUpcomingRentals: {
        type: 'rentals' as const,
        title: 'No upcoming trips',
        description: 'You have no upcoming reservations scheduled.',
        action: {
            label: 'Plan a Trip',
            href: '/cars',
        },
    },
    noCompletedRentals: {
        type: 'rentals' as const,
        title: 'No completed trips',
        description: "You haven't completed any rentals yet.",
    },
    noCancelledRentals: {
        type: 'rentals' as const,
        title: 'No cancelled trips',
        description: 'None of your rentals were cancelled.',
    },
    noCars: {
        type: 'cars' as const,
        title: 'No cars found',
        description: 'Try adjusting your filters to find available vehicles.',
        action: {
            label: 'Clear Filters',
        },
    },
    noSearchResults: {
        type: 'search' as const,
        title: 'No results found',
        description: 'Try different keywords or check your spelling.',
    },
};