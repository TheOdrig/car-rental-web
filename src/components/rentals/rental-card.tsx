'use client';

import { memo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Car, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Rental, RentalStatus } from '@/types';

interface RentalCardProps {
    rental: Rental;
    variant?: 'default' | 'compact';
    className?: string;
    onClick?: (rental: Rental) => void;
}

interface RentalCardSkeletonProps {
    variant?: 'default' | 'compact';
    className?: string;
}

function getStatusBadgeVariant(status: RentalStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'Confirmed':
        case 'In Use':
            return 'default';
        case 'Requested':
            return 'secondary';
        case 'Returned':
            return 'outline';
        case 'Cancelled':
            return 'destructive';
        default:
            return 'outline';
    }
}

function getStatusColor(status: RentalStatus): string {
    switch (status) {
        case 'Confirmed':
            return 'bg-green-500/10 text-green-600 border-green-200';
        case 'In Use':
            return 'bg-blue-500/10 text-blue-600 border-blue-200';
        case 'Requested':
            return 'bg-amber-500/10 text-amber-600 border-amber-200';
        case 'Returned':
            return 'bg-slate-500/10 text-slate-600 border-slate-200';
        case 'Cancelled':
            return 'bg-red-500/10 text-red-600 border-red-200';
        default:
            return '';
    }
}

function formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price);
}

function formatDate(dateString: string): string {
    return format(new Date(dateString), 'MMM d, yyyy');
}

export const RentalCard = memo(function RentalCard({
    rental,
    variant = 'default',
    className,
    onClick,
}: RentalCardProps) {
    const { carSummary, startDate, endDate, days, totalPrice, currency, status } = rental;

    const cardContent = (
        <Card
            className={cn(
                'group overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer',
                variant === 'compact' && 'py-2',
                className
            )}
            onClick={() => onClick?.(rental)}
        >
            <CardContent className={cn('p-4', variant === 'compact' && 'p-3')}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <Car className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <h3 className="font-semibold text-lg leading-tight truncate">
                                {carSummary.brand} {carSummary.model}
                            </h3>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{formatDate(startDate)}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>{formatDate(endDate)}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{days} {days === 1 ? 'day' : 'days'}</span>
                            </div>
                            <span className="font-semibold text-primary">
                                {formatPrice(totalPrice, currency)}
                            </span>
                        </div>
                    </div>

                    <Badge
                        variant={getStatusBadgeVariant(status)}
                        className={cn(
                            'flex-shrink-0 border',
                            getStatusColor(status)
                        )}
                    >
                        {status}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );

    if (!onClick) {
        return (
            <Link href={`/rentals/${rental.id}`} className="block">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
});


export function RentalCardSkeleton({ variant = 'default', className }: RentalCardSkeletonProps) {
    return (
        <Card className={cn('overflow-hidden', variant === 'compact' && 'py-2', className)}>
            <CardContent className={cn('p-4', variant === 'compact' && 'p-3')}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-6 w-48" />
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-3 rounded" />
                            <Skeleton className="h-4 w-24" />
                        </div>

                        <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>

                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </CardContent>
        </Card>
    );
}
