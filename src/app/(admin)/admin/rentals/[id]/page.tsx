'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, DollarSign, Car, User, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { PenaltyWaiveDialog, PenaltyHistorySection, LateReturnStatusBadge } from '@/components/admin';
import { useRental } from '@/lib/hooks';
import { formatCurrency } from '@/lib/utils/format';
import { safeFormatDate } from '@/lib/utils/format';
import type { LateReturnStatus } from '@/types';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function RentalDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const rentalId = parseInt(id, 10);

    const { data: rental, isLoading, isError } = useRental(rentalId);
    const [waiveDialogOpen, setWaiveDialogOpen] = useState(false);

    if (isNaN(rentalId)) {
        router.push('/admin/rentals');
        return null;
    }

    if (isLoading) {
        return <RentalDetailSkeleton />;
    }

    if (isError || !rental) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Rental Not Found
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    The rental you are looking for does not exist.
                </p>
                <Button asChild className="mt-4">
                    <Link href="/admin/rentals">Back to Rentals</Link>
                </Button>
            </div>
        );
    }

    const rentalWithPenalty = rental as typeof rental & {
        penaltyAmount?: number;
        lateReturnStatus?: LateReturnStatus;
    };

    const hasPenalty = (rentalWithPenalty.penaltyAmount ?? 0) > 0;

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Rentals', href: '/admin/rentals' },
                    { label: `Rental #${rentalId}` },
                ]}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 p-6 rounded-3xl border border-white/50 dark:border-white/5 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Rental #{rentalId}
                        </h1>
                        <Badge variant="outline" className="text-sm">
                            {rental.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {rental.carSummary?.brand} {rental.carSummary?.model}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                        <Link href="/admin/rentals">
                            <ArrowLeft className="h-4 w-4" />
                            Back to List
                        </Link>
                    </Button>
                    {hasPenalty && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={() => setWaiveDialogOpen(true)}
                        >
                            <DollarSign className="h-4 w-4" />
                            Waive Penalty
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-5 w-5 text-blue-500" />
                            Customer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                            {rental.userSummary?.username}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {rental.userSummary?.email}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Car className="h-5 w-5 text-green-500" />
                            Vehicle
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                            {rental.carSummary?.brand} {rental.carSummary?.model}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {rental.carSummary?.licensePlate}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Calendar className="h-5 w-5 text-purple-500" />
                            Duration
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                            {rental.days} days
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {safeFormatDate(rental.startDate)} - {safeFormatDate(rental.endDate)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="h-5 w-5 text-orange-500" />
                        Pricing
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Daily Rate</div>
                            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                {formatCurrency(rental.dailyPrice, rental.currency)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Total Price</div>
                            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                {formatCurrency(rental.totalPrice, rental.currency)}
                            </div>
                        </div>
                        {hasPenalty && (
                            <div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    Late Return Penalty
                                    {rentalWithPenalty.lateReturnStatus && (
                                        <LateReturnStatusBadge status={rentalWithPenalty.lateReturnStatus} />
                                    )}
                                </div>
                                <div className="text-xl font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(rentalWithPenalty.penaltyAmount ?? 0, rental.currency)}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {hasPenalty && (
                <>
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="h-5 w-5 text-red-500" />
                                Late Return Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                {rentalWithPenalty.lateReturnStatus && (
                                    <LateReturnStatusBadge status={rentalWithPenalty.lateReturnStatus} />
                                )}
                                <div className="text-slate-600 dark:text-slate-400">
                                    Penalty: <span className="font-bold text-red-600 dark:text-red-400">
                                        {formatCurrency(rentalWithPenalty.penaltyAmount ?? 0, rental.currency)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <PenaltyHistorySection rentalId={rentalId} currency={rental.currency} />
                </>
            )}

            {hasPenalty && (
                <PenaltyWaiveDialog
                    open={waiveDialogOpen}
                    onOpenChange={setWaiveDialogOpen}
                    rentalId={rentalId}
                    originalPenalty={rentalWithPenalty.penaltyAmount ?? 0}
                    currency={rental.currency}
                />
            )}
        </div>
    );
}

function RentalDetailSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="flex justify-between">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
