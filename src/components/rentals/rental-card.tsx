'use client';

import { memo, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Calendar,
    Car,
    Clock,
    ArrowRight,
    MapPin,
    ExternalLink,
    Fuel,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { safeFormatDate } from '@/lib/utils/format';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Rental, RentalStatus, ActionButton } from '@/types';
import { getActionButtons, getStatusBadgeVariant } from '@/lib/utils/rental-utils';

interface RentalCardProps {
    rental: Rental;
    variant?: 'default' | 'compact' | 'detailed';
    showActions?: boolean;
    className?: string;
    onClick?: (rental: Rental) => void;
    onAction?: (action: string, rental: Rental) => void;
}

interface RentalCardSkeletonProps {
    variant?: 'default' | 'compact' | 'detailed';
    className?: string;
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
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency || 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}


function getFuelIcon(fuelType?: string): ReactNode {
    if (!fuelType) return null;
    const isElectric = fuelType.toLowerCase().includes('electric');
    return isElectric ? (
        <Zap className="h-3 w-3" />
    ) : (
        <Fuel className="h-3 w-3" />
    );
}

function ActionButtons({
    actions,
    rental,
    onAction,
}: {
    actions: ActionButton[];
    rental: Rental;
    onAction?: (action: string, rental: Rental) => void;
}) {
    if (actions.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            {actions.map((action) => (
                <Button
                    key={action.action}
                    variant={action.variant}
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onAction?.(action.action, rental);
                    }}
                >
                    {action.label}
                </Button>
            ))}
        </div>
    );
}

export const RentalCard = memo(function RentalCard({
    rental,
    variant = 'default',
    showActions = false,
    className,
    onClick,
    onAction,
}: RentalCardProps) {
    const { carSummary, startDate, endDate, days, totalPrice, currency, status, id } = rental;
    const isActive = status === 'In Use';
    const isCompleted = status === 'Returned';
    const actions = showActions ? getActionButtons(status) : [];

    const referenceId = `R-${id.toString().padStart(4, '0')}`;

    if (variant === 'detailed') {
        const cardContent = (
            <Card
                className={cn(
                    'group overflow-hidden transition-all duration-300 hover:shadow-lg',
                    isActive && 'border-l-4 border-l-primary shadow-md',
                    isCompleted && 'opacity-90',
                    onClick && 'cursor-pointer',
                    className
                )}
                onClick={() => onClick?.(rental)}
            >
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                        <div className="relative h-48 w-full md:h-auto md:w-80 shrink-0">
                            <Image
                                src={carSummary.thumbnailUrl || '/images/car-placeholder.jpg'}
                                alt={`${carSummary.brand} ${carSummary.model}`}
                                fill
                                className={cn(
                                    'object-cover transition-all duration-300',
                                    isCompleted && 'grayscale group-hover:grayscale-0'
                                )}
                            />
                            {carSummary.color && (
                                <Badge
                                    variant="secondary"
                                    className="absolute left-3 top-3 gap-1 bg-background/80 backdrop-blur-sm"
                                >
                                    {getFuelIcon(carSummary.color)}
                                    <span className="text-xs">{carSummary.color}</span>
                                </Badge>
                            )}
                        </div>

                        <div className="flex flex-1 flex-col p-4">
                            <div className="mb-3 flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">{referenceId}</p>
                                    <h3 className="text-lg font-semibold">
                                        {carSummary.brand} {carSummary.model}
                                    </h3>
                                </div>
                                <Badge
                                    variant={getStatusBadgeVariant(status)}
                                    className={cn('shrink-0 border', getStatusColor(status))}
                                >
                                    {status}
                                </Badge>
                            </div>

                            <div className="mb-4 grid gap-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4 shrink-0" />
                                    <span>{safeFormatDate(startDate)}</span>
                                    <ArrowRight className="h-3 w-3" />
                                    <span>{safeFormatDate(endDate)}</span>
                                    <Badge variant="outline" className="ml-1 text-xs">
                                        {days} {days === 1 ? 'day' : 'days'}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4 shrink-0" />
                                        <span>San Francisco Airport</span>
                                    </div>
                                    <button
                                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                    >
                                        Get Directions
                                        <ExternalLink className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-auto flex items-center justify-between border-t pt-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-primary">
                                        {formatPrice(totalPrice, currency)}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        Paid
                                    </Badge>
                                </div>
                                <ActionButtons
                                    actions={actions}
                                    rental={rental}
                                    onAction={onAction}
                                />
                            </div>
                        </div>
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
    }

    const cardContent = (
        <Card
            className={cn(
                'group overflow-hidden transition-all duration-300 hover:shadow-lg',
                isActive && 'border-l-4 border-l-primary',
                onClick && 'cursor-pointer',
                variant === 'compact' && 'py-2',
                className
            )}
            onClick={() => onClick?.(rental)}
        >
            <CardContent className={cn('p-4', variant === 'compact' && 'p-3')}>
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <Car className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <h3 className="truncate text-lg font-semibold leading-tight">
                                {carSummary.brand} {carSummary.model}
                            </h3>
                        </div>

                        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>{safeFormatDate(startDate)}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>{safeFormatDate(endDate)}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {days} {days === 1 ? 'day' : 'days'}
                                </span>
                            </div>
                            <span className="font-semibold text-primary">
                                {formatPrice(totalPrice, currency)}
                            </span>
                        </div>
                    </div>

                    <Badge
                        variant={getStatusBadgeVariant(status)}
                        className={cn('shrink-0 border', getStatusColor(status))}
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
    if (variant === 'detailed') {
        return (
            <Card className={cn('overflow-hidden', className)}>
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                        <Skeleton className="h-48 w-full md:h-52 md:w-80 shrink-0" />
                        <div className="flex flex-1 flex-col p-4">
                            <div className="mb-3 flex items-start justify-between">
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-6 w-40" />
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <div className="mb-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-36" />
                                </div>
                            </div>
                            <div className="mt-auto flex items-center justify-between border-t pt-3">
                                <Skeleton className="h-7 w-24" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-24" />
                                    <Skeleton className="h-8 w-32" />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn('overflow-hidden', variant === 'compact' && 'py-2', className)}>
            <CardContent className={cn('p-4', variant === 'compact' && 'p-3')}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-6 w-48" />
                        </div>

                        <div className="mb-3 flex items-center gap-2">
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
