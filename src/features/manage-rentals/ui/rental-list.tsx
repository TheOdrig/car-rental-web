'use client';

import Link from 'next/link';
import { Car, CalendarX, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RentalCard, RentalCardSkeleton } from './rental-card';
import type { Rental, RentalTab } from '@/types';

interface RentalListProps {
    rentals: Rental[];
    variant?: 'default' | 'compact' | 'detailed';
    showActions?: boolean;
    className?: string;
    onRentalClick?: (rental: Rental) => void;
    onAction?: (action: string, rental: Rental) => void;
}

interface RentalListSkeletonProps {
    count?: number;
    variant?: 'default' | 'compact' | 'detailed';
    className?: string;
}

interface RentalListEmptyProps {
    tab?: RentalTab;
    title?: string;
    description?: string;
    showBrowseLink?: boolean;
}

const TAB_EMPTY_STATES: Record<RentalTab, { title: string; description: string; icon: typeof Car }> = {
    all: {
        title: 'No rentals yet',
        description: "You haven't made any rental requests. Browse our cars and book your first rental!",
        icon: Car,
    },
    active: {
        title: 'No active trips',
        description: "You don't have any active rentals at the moment.",
        icon: Clock,
    },
    upcoming: {
        title: 'No upcoming trips',
        description: 'You have no upcoming reservations scheduled.',
        icon: CalendarX,
    },
    completed: {
        title: 'No completed trips',
        description: "You haven't completed any rentals yet.",
        icon: CheckCircle,
    },
    cancelled: {
        title: 'No cancelled trips',
        description: 'Great news! You have no cancelled reservations.',
        icon: XCircle,
    },
};

export function RentalList({
    rentals,
    variant = 'default',
    showActions = false,
    className,
    onRentalClick,
    onAction,
}: RentalListProps) {
    if (rentals.length === 0) {
        return <RentalListEmpty />;
    }

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            {rentals.map((rental) => (
                <RentalCard
                    key={rental.id}
                    rental={rental}
                    variant={variant}
                    showActions={showActions}
                    onClick={onRentalClick}
                    onAction={onAction}
                />
            ))}
        </div>
    );
}

export function RentalListSkeleton({
    count = 5,
    variant = 'default',
    className,
}: RentalListSkeletonProps) {
    return (
        <div className={cn('flex flex-col gap-4', className)}>
            {Array.from({ length: count }).map((_, index) => (
                <RentalCardSkeleton key={index} variant={variant} />
            ))}
        </div>
    );
}

export function RentalListEmpty({
    tab = 'all',
    title,
    description,
    showBrowseLink = true,
}: RentalListEmptyProps) {
    const emptyState = TAB_EMPTY_STATES[tab] || TAB_EMPTY_STATES.all;
    const Icon = emptyState.icon;
    const displayTitle = title || emptyState.title;
    const displayDescription = description || emptyState.description;

    return (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <div className="mb-6 rounded-full bg-slate-100 dark:bg-slate-800 p-6">
                <Icon className="h-12 w-12 text-slate-500 dark:text-slate-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">{displayTitle}</h3>
            <p className="mb-6 max-w-sm text-slate-600 dark:text-slate-400">{displayDescription}</p>
            {showBrowseLink && tab === 'all' && (
                <Button asChild>
                    <Link href="/cars">Browse Cars</Link>
                </Button>
            )}
        </div>
    );
}

