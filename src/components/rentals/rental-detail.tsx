'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    Calendar,
    Clock,
    Car,
    CreditCard,
    Loader2,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { RentalTimeline } from './rental-timeline';
import { useCancelRental } from '@/lib/hooks';
import type { Rental, RentalStatus } from '@/types';

interface RentalDetailProps {
    rental: Rental;
    className?: string;
    onCancelSuccess?: () => void;
}

interface RentalDetailSkeletonProps {
    className?: string;
}

function formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(price);
}

function formatDate(dateString: string): string {
    return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
}

function formatDateTime(dateString: string): string {
    return format(new Date(dateString), 'MMM d, yyyy \'at\' h:mm a');
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

export function RentalDetail({ rental, className, onCancelSuccess }: RentalDetailProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const cancelMutation = useCancelRental();

    const { carSummary, startDate, endDate, days, dailyPrice, totalPrice, currency, status } = rental;
    const canCancel = status === 'Requested';

    const handleCancel = async () => {
        try {
            await cancelMutation.mutateAsync(rental.id);
            setShowCancelDialog(false);
            onCancelSuccess?.();
        } catch {
            // Error handled by mutation
        }
    };

    return (
        <div className={cn('space-y-6', className)}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold">Rental #{rental.id}</h1>
                        <Badge className={cn('border', getStatusColor(status))}>
                            {status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Created {formatDateTime(rental.createTime)}
                    </p>
                </div>

                {canCancel && (
                    <Button
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setShowCancelDialog(true)}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Rental
                    </Button>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Vehicle
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link
                                href={`/cars/${carSummary.id}`}
                                className="flex items-center gap-4 group"
                            >
                                <div className="relative h-20 w-32 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={carSummary.thumbnailUrl ?? '/images/car-placeholder.svg'}
                                        alt={`${carSummary.brand} ${carSummary.model}`}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold text-lg group-hover:text-primary transition-colors">
                                        {carSummary.brand} {carSummary.model}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {carSummary.productionYear} • {carSummary.licensePlate}
                                    </p>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Rental Period
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <p className="text-sm text-muted-foreground mb-1">Pick-up</p>
                                    <p className="font-semibold">{formatDate(startDate)}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <p className="text-sm text-muted-foreground mb-1">Return</p>
                                    <p className="font-semibold">{formatDate(endDate)}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{days} {days === 1 ? 'day' : 'days'} total</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Daily rate</span>
                                    <span>{formatPrice(dailyPrice, currency)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span>{days} {days === 1 ? 'day' : 'days'}</span>
                                </div>
                                {rental.totalSavings && rental.totalSavings > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Savings</span>
                                        <span>-{formatPrice(rental.totalSavings, currency)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary">{formatPrice(totalPrice, currency)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {(rental.pickupNotes || rental.returnNotes) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Notes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {rental.pickupNotes && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Pickup Notes</p>
                                        <p>{rental.pickupNotes}</p>
                                    </div>
                                )}
                                {rental.returnNotes && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Return Notes</p>
                                        <p>{rental.returnNotes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Status Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RentalTimeline status={status} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Rental</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this rental request? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                            disabled={cancelMutation.isPending}
                        >
                            Keep Rental
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={cancelMutation.isPending}
                        >
                            {cancelMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                'Cancel Rental'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export function RentalDetailSkeleton({ className }: RentalDetailSkeletonProps) {
    return (
        <div className={cn('space-y-6', className)}>
            <div className="flex items-start justify-between">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-24" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-20 w-32 rounded-lg" />
                                <div>
                                    <Skeleton className="h-6 w-40 mb-2" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Skeleton className="h-20 rounded-lg" />
                                <Skeleton className="h-20 rounded-lg" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-36" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-5 w-24 mb-1" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
