'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Calendar,
    Clock,
    Car,
    CreditCard,
    Loader2,
    X,
    Headphones,
    Edit,
    User,
    Shield,
    Check,
    XCircle,
    MapPin,
    Download,
    ExternalLink,
    Fuel,
    Settings2,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { safeFormatDate, safeFormatDateTime } from '@/lib/utils/format';
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
import { showToast } from '@/lib/utils/toast';
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
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency || 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
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

const INSURANCE_ITEMS = [
    { name: 'Basic Coverage', included: true },
    { name: 'Collision Damage Waiver', included: true },
    { name: 'Theft Protection', included: true },
    { name: 'Premium Roadside Assistance', included: false },
    { name: 'Personal Injury Protection', included: false },
];

export function RentalDetail({ rental, className, onCancelSuccess }: RentalDetailProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const cancelMutation = useCancelRental();

    const { carSummary, startDate, endDate, days, dailyPrice, totalPrice, currency, status } = rental;
    const canCancel = status === 'Requested';
    const canModify = status === 'Requested' || status === 'Confirmed';

    const handleCancel = async () => {
        try {
            await cancelMutation.mutateAsync(rental.id);
            setShowCancelDialog(false);
            onCancelSuccess?.();
        } catch {
            // Error handled by mutation
        }
    };

    const handleSupport = () => {
        showToast.info('Opening support chat...');
    };

    const handleModifyDates = () => {
        showToast.info('Modify dates feature coming soon');
    };

    const handleDownloadInvoice = () => {
        showToast.info('Downloading invoice...');
    };

    const handleGetDirections = () => {
        window.open('https://maps.google.com/?q=San+Francisco+Airport', '_blank');
    };

    return (
        <div className={cn('space-y-6', className)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-3">
                        <h1 className="text-2xl font-bold">Order #{rental.id}</h1>
                        <Badge className={cn('border', getStatusColor(status))}>
                            {status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Booked on {safeFormatDateTime(rental.createTime)}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSupport}>
                        <Headphones className="mr-2 h-4 w-4" />
                        Support
                    </Button>
                    {canModify && (
                        <Button variant="outline" onClick={handleModifyDates}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modify Dates
                        </Button>
                    )}
                    {canCancel && (
                        <Button
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => setShowCancelDialog(true)}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Car className="h-5 w-5" />
                                Vehicle Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link
                                href={`/cars/${carSummary.id}`}
                                className="group flex gap-4"
                            >
                                <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-lg">
                                    <Image
                                        src={carSummary.thumbnailUrl ?? '/images/car-placeholder.svg'}
                                        alt={`${carSummary.brand} ${carSummary.model}`}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xl font-semibold transition-colors group-hover:text-primary">
                                        {carSummary.brand} {carSummary.model}
                                    </p>
                                    <p className="mb-3 text-muted-foreground">
                                        {carSummary.productionYear} • {carSummary.licensePlate}
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <Badge variant="outline" className="gap-1">
                                            <Fuel className="h-3 w-3" />
                                            {carSummary.color || 'Gasoline'}
                                        </Badge>
                                        <Badge variant="outline" className="gap-1">
                                            <Settings2 className="h-3 w-3" />
                                            Automatic
                                        </Badge>
                                        <Badge variant="outline" className="gap-1">
                                            <Users className="h-3 w-3" />
                                            5 Seats
                                        </Badge>
                                    </div>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5" />
                                Driver Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <p className="mb-1 text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium">{rental.userSummary.username}</p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-muted-foreground">License Number</p>
                                    <p className="font-medium">••••••1234</p>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm text-muted-foreground">Contact</p>
                                    <p className="font-medium">{rental.userSummary.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {(rental.approvalNotes || rental.cancellationReason || rental.pickupNotes || rental.returnNotes) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Edit className="h-5 w-5" />
                                    Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {rental.approvalNotes && (
                                    <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3 border border-green-200 dark:border-green-800">
                                        <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Approval Note</p>
                                        <p className="text-sm text-green-600 dark:text-green-400">{rental.approvalNotes}</p>
                                    </div>
                                )}
                                {rental.cancellationReason && (
                                    <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 border border-red-200 dark:border-red-800">
                                        <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Cancellation Reason</p>
                                        <p className="text-sm text-red-600 dark:text-red-400">{rental.cancellationReason}</p>
                                    </div>
                                )}
                                {rental.pickupNotes && (
                                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Pickup Note</p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">{rental.pickupNotes}</p>
                                    </div>
                                )}
                                {rental.returnNotes && (
                                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-700">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Return Note</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{rental.returnNotes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="h-5 w-5" />
                                Rental Period
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <p className="mb-1 text-sm text-muted-foreground">Pick-up</p>
                                    <p className="font-semibold">{safeFormatDate(startDate, 'EEEE, MMMM d, yyyy')}</p>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <p className="mb-1 text-sm text-muted-foreground">Return</p>
                                    <p className="font-semibold">{safeFormatDate(endDate, 'EEEE, MMMM d, yyyy')}</p>
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
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Shield className="h-5 w-5" />
                                Insurance & Protection
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {INSURANCE_ITEMS.map((item) => (
                                    <div
                                        key={item.name}
                                        className={cn(
                                            'flex items-center gap-2 rounded-lg p-2',
                                            item.included ? 'text-foreground' : 'text-muted-foreground'
                                        )}
                                    >
                                        {item.included ? (
                                            <Check className="h-4 w-4 shrink-0 text-green-500" />
                                        ) : (
                                            <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        )}
                                        <span className="text-sm">{item.name}</span>
                                        {item.included && (
                                            <Badge variant="secondary" className="ml-auto text-xs">
                                                Included
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="h-5 w-5" />
                                Pickup Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 h-48 overflow-hidden rounded-lg bg-muted">
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    <MapPin className="mr-2 h-6 w-6" />
                                    <span>San Francisco International Airport</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">SFO Airport Terminal 1</p>
                                    <p className="text-sm text-muted-foreground">
                                        780 S Airport Blvd, San Francisco, CA 94128
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleGetDirections}>
                                    Get Directions
                                    <ExternalLink className="ml-2 h-3 w-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CreditCard className="h-5 w-5" />
                                Payment Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Daily rate</span>
                                    <span>{formatPrice(dailyPrice, currency)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span>{days} {days === 1 ? 'day' : 'days'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatPrice(dailyPrice * days, currency)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Insurance</span>
                                    <span className="text-green-600">Included</span>
                                </div>
                                {rental.totalSavings && rental.totalSavings > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Savings</span>
                                        <span>-{formatPrice(rental.totalSavings, currency)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t pt-3 text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">{formatPrice(totalPrice, currency)}</span>
                                </div>
                            </div>

                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950">
                                <p className="font-medium text-amber-800 dark:text-amber-200">
                                    Security Deposit
                                </p>
                                <p className="text-amber-700 dark:text-amber-300">
                                    {formatPrice(500, currency)} hold will be released after return
                                </p>
                            </div>

                            <Button className="w-full" variant="outline" onClick={handleDownloadInvoice}>
                                <Download className="mr-2 h-4 w-4" />
                                Download Invoice
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Status Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RentalTimeline
                                status={status}
                                startDate={startDate}
                                endDate={endDate}
                            />
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
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                    <Skeleton className="mb-2 h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Skeleton className="h-32 w-48 rounded-lg" />
                                <div className="flex-1">
                                    <Skeleton className="mb-2 h-6 w-48" />
                                    <Skeleton className="mb-3 h-4 w-32" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-6 w-20" />
                                        <Skeleton className="h-6 w-24" />
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-28" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i}>
                                        <Skeleton className="mb-1 h-4 w-20" />
                                        <Skeleton className="h-5 w-32" />
                                    </div>
                                ))}
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
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-36" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="mt-4 h-16 w-full rounded-lg" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="flex-1">
                                            <Skeleton className="mb-1 h-5 w-24" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
