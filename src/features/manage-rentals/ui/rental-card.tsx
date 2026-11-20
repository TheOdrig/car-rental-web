'use client';

import { memo, type ReactNode } from 'react';
import Link from 'next/link';
import { DynamicImage } from '@/shared/ui/dynamic-image';
import {
    Calendar,
    Car,
    Clock,
    ArrowRight,
} from 'lucide-react';
import { cn, formatDate, formatCurrency, formatRentalReference } from '@/shared/lib';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import type { Rental, ActionButton } from '@/entities/rental';
import {
    getActionButtons,
    RentalStatusBadge,
    RentalCancellationNotice,
    RentalPaymentNote,
    RentalStatus,
} from '@/entities/rental';

interface RentalCardProps {
    rental: Rental;
    variant?: 'default' | 'compact' | 'detailed';
    showActions?: boolean;
    className?: string;
    priority?: boolean;
    onClick?: (rental: Rental) => void;
    onAction?: (action: string, rental: Rental) => void;
}

interface RentalCardSkeletonProps {
    variant?: 'default' | 'compact' | 'detailed';
    className?: string;
}

function CardTitleLink({ href, children }: { href?: string; children: ReactNode }) {
    if (!href) return <>{children}</>;
    return (
        <Link
            href={href}
            className="rounded-sm after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
        >
            {children}
        </Link>
    );
}

function formatPrice(price: number, currency: string): string {
    return formatCurrency(price, currency || 'USD');
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

    const hint = actions.find((action) => action.disabled && action.hint)?.hint;

    return (
        <div className="relative z-10 flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
                {actions.map((action) => (
                    <Button
                        key={action.action}
                        variant={action.variant}
                        size="sm"
                        className="cursor-pointer"
                        disabled={action.disabled}
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
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}

export const RentalCard = memo(function RentalCard({
    rental,
    variant = 'default',
    showActions = false,
    className,
    priority = false,
    onClick,
    onAction,
}: RentalCardProps) {
    const { carSummary, startDate, endDate, days, totalPrice, currency, status, id, paymentOpensOn } = rental;
    const isActive = status === RentalStatus.IN_USE;
    const isCompleted = status === RentalStatus.RETURNED;
    const actions = showActions ? getActionButtons(status, { paymentOpensOn, paymentStatus: rental.paymentStatus }) : [];

    const referenceId = formatRentalReference(id);
    const href = onClick ? undefined : `/rentals/${rental.id}`;

    if (variant === 'detailed') {
        const cardContent = (
            <Card
                className={cn(
                    'group relative gap-0 overflow-hidden py-0 transition-shadow duration-200 hover:shadow-md',
                    isActive && 'border-l-4 border-l-primary shadow-md',
                    (onClick || href) && 'cursor-pointer',
                    className
                )}
                onClick={() => onClick?.(rental)}
            >
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                        <div className="relative h-48 w-full md:h-auto md:w-80 shrink-0">
                            <DynamicImage
                                src={carSummary?.thumbnailUrl || '/images/car-placeholder.svg'}
                                alt={`${carSummary?.brand} ${carSummary?.model}`}
                                fill
                                priority={priority}
                                fetchPriority={priority ? "high" : undefined}
                                sizes="(min-width: 768px) 320px, 100vw"
                                className={cn(
                                    'object-cover transition-all duration-300',
                                    isCompleted && 'grayscale group-hover:grayscale-0'
                                )}
                            />
                        </div>

                        <div className="flex flex-1 flex-col p-4">
                            <div className="mb-3 flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">{referenceId}</p>
                                    <h2 className="truncate text-lg font-semibold" title={`${carSummary?.brand} ${carSummary?.model}`}>
                                        <CardTitleLink href={href}>
                                            {carSummary?.brand} {carSummary?.model}
                                        </CardTitleLink>
                                    </h2>
                                </div>
                                <RentalStatusBadge
 status={status}
 className="shrink-0 cursor-default"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
 />
                            </div>

                            <div className="mb-4 grid gap-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4 shrink-0" />
                                    <span>{formatDate(startDate)}</span>
                                    <ArrowRight className="h-3 w-3" />
                                    <span>{formatDate(endDate)}</span>
                                    <Badge variant="neutral" className="ml-1 text-xs">
                                        {days} {days === 1 ? 'day' : 'days'}
                                    </Badge>
                                </div>
                            </div>

                            {status === RentalStatus.CANCELLED && (
                                <RentalCancellationNotice
                                    className="mb-3"
                                    cancelledBy={rental.cancelledBy}
                                    reason={rental.cancellationReason}
                                />
                            )}
                            <RentalPaymentNote
                                className="mb-3"
                                status={status}
                                paymentStatus={rental.paymentStatus}
                                paymentDueBy={rental.paymentDueBy}
                            />

                            <div className="mt-auto flex items-center justify-between border-t pt-3">
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    {formatPrice(totalPrice, currency || 'USD')}
                                </span>
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

        return cardContent;
    }

    const cardContent = (
        <Card
            className={cn(
                'group relative gap-0 overflow-hidden py-0 transition-shadow duration-200 hover:shadow-md',
                isActive && 'border-l-4 border-l-primary',
                (onClick || href) && 'cursor-pointer',
                variant === 'compact' ? 'py-2' : 'py-0',
                className
            )}
            onClick={() => onClick?.(rental)}
        >
            <CardContent className={cn('p-4', variant === 'compact' && 'p-3')}>
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <Car className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <h2 className="truncate text-lg font-semibold leading-tight">
                                <CardTitleLink href={href}>
                                    {carSummary?.brand} {carSummary?.model}
                                </CardTitleLink>
                            </h2>
                        </div>

                        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>{formatDate(startDate)}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>{formatDate(endDate)}</span>
                        </div>

                        {status === RentalStatus.CANCELLED && (
                            <RentalCancellationNotice
                                className="mb-2"
                                cancelledBy={rental.cancelledBy}
                                reason={rental.cancellationReason}
                            />
                        )}
                        <RentalPaymentNote
                            className="mb-2"
                            status={status}
                            paymentStatus={rental.paymentStatus}
                            paymentDueBy={rental.paymentDueBy}
                        />

                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {days} {days === 1 ? 'day' : 'days'}
                                </span>
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {formatPrice(totalPrice, currency || 'USD')}
                            </span>
                        </div>
                    </div>

                    <RentalStatusBadge
 status={status}
 className="shrink-0 cursor-default"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
 />
                </div>
            </CardContent>
        </Card>
    );

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
