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
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type EmptyStateType = 'default' | 'search' | 'cart' | 'users' | 'cars' | 'rentals';

interface HelpLink {
    label: string;
    href: string;
    icon?: LucideIcon;
    external?: boolean;
}

interface EmptyStateProps {
    type?: EmptyStateType;
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
    title,
    description,
    illustration,
    action,
    helpLinks,
    className,
    children,
}: EmptyStateProps) {
    const Icon = iconMap[type];

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center px-4 py-12 text-center',
                className
            )}
        >
            {illustration ? (
                <div className="relative mb-6 h-40 w-40">
                    <Image
                        src={illustration}
                        alt=""
                        fill
                        className="object-contain"
                    />
                </div>
            ) : (
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <Icon className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                </div>
            )}

            <h3 className="text-lg font-semibold">{title}</h3>

            {description && (
                <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
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
                                className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-slate-100"
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
        description: 'Great news! You have no cancelled reservations.',
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
