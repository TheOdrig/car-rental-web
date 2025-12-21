'use client';

import Link from 'next/link';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RentalCard, RentalCardSkeleton } from './rental-card';
import type { Rental } from '@/types';

interface RentalListProps {
    rentals: Rental[];
    variant?: 'default' | 'compact';
    className?: string;
    onRentalClick?: (rental: Rental) => void;
}

interface RentalListSkeletonProps {
    count?: number;
    variant?: 'default' | 'compact';
    className?: string;
}

interface RentalListEmptyProps {
    title?: string;
    description?: string;
    showBrowseLink?: boolean;
}

export function RentalList({
    rentals,
    variant = 'default',
    className,
    onRentalClick,
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
                    onClick={onRentalClick}
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
    title = 'No rentals yet',
    description = "You haven't made any rental requests. Browse our cars and book your first rental!",
    showBrowseLink = true,
}: RentalListEmptyProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-muted p-6 mb-6">
                <Car className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
            {showBrowseLink && (
                <Button asChild>
                    <Link href="/cars">Browse Cars</Link>
                </Button>
            )}
        </div>
    );
}
