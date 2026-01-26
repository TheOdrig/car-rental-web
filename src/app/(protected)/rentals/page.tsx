'use client';

import { useState, useMemo, useCallback } from 'react';
import { Download } from 'lucide-react';
import { logger } from '@/lib/utils/logger';
import { useMyRentals, useCancelRental } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/shared';
import {
    RentalList,
    RentalListSkeleton,
    RentalListEmpty,
    RentalStats,
    RentalTabs,
} from '@/components/rentals';
import type { RentalTab, Rental } from '@/types';
import {
    getRentalsByTab,
    calculateTabCounts,
    calculateRentalStats,
} from '@/lib/utils/rental-utils';
import { showToast } from '@/lib/utils/toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function MyRentalsPage() {
    const { data, isLoading, error } = useMyRentals();
    const cancelMutation = useCancelRental();
    const [activeTab, setActiveTab] = useState<RentalTab>('all');
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [rentalToCancel, setRentalToCancel] = useState<Rental | null>(null);

    const rentals = useMemo(() => data?.content ?? [], [data]);

    const tabCounts = useMemo(() => calculateTabCounts(rentals), [rentals]);

    const stats = useMemo(() => calculateRentalStats(rentals), [rentals]);

    const filteredRentals = useMemo(
        () => getRentalsByTab(rentals, activeTab),
        [rentals, activeTab]
    );

    const handleTabChange = useCallback((tab: RentalTab) => {
        setActiveTab(tab);
    }, []);

    const handleAction = useCallback((action: string, rental: Rental) => {
        switch (action) {
            case 'view':
                window.location.href = `/rentals/${rental.id}`;
                break;
            case 'receipt':
                showToast.info(`Downloading receipt for rental #${rental.id}`);
                break;
            case 'book-again':
                window.location.href = `/cars/${rental.carSummary.id}`;
                break;
            case 'cancel':
                setRentalToCancel(rental);
                setCancelDialogOpen(true);
                break;
            default:
                logger.warn(`Unknown action: ${action}`);
        }
    }, []);

    const handleConfirmCancel = useCallback(() => {
        if (rentalToCancel) {
            cancelMutation.mutate(rentalToCancel.id);
            setCancelDialogOpen(false);
            setRentalToCancel(null);
        }
    }, [rentalToCancel, cancelMutation]);

    const handleExport = useCallback(() => {
        showToast.info('Exporting rental history...');
    }, []);

    if (error) {
        return (
            <div className="container py-8">
                <div className="rounded-lg bg-destructive/10 p-6 text-center text-destructive">
                    <h3 className="mb-2 text-lg font-semibold">Failed to load rentals</h3>
                    <p>Please try again later or contact support if the problem persists.</p>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="container py-8">
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">My Rentals</h1>
                        <p className="mt-1 text-muted-foreground">
                            View and manage your rental history
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="hidden gap-2 md:flex bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4" />
                        Export History
                    </Button>
                </div>

                <div className="mb-8">
                    {isLoading ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Skeleton className="h-24" />
                            <Skeleton className="h-24" />
                        </div>
                    ) : (
                        <RentalStats stats={stats} />
                    )}
                </div>

                <div className="mb-6">
                    {isLoading ? (
                        <div className="flex gap-4 border-b pb-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-8 w-24" />
                            ))}
                        </div>
                    ) : (
                        <RentalTabs
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            counts={tabCounts}
                        />
                    )}
                </div>

                <div
                    role="tabpanel"
                    id={`tabpanel-${activeTab}`}
                    aria-labelledby={`tab-${activeTab}`}
                >
                    {isLoading ? (
                        <RentalListSkeleton count={3} variant="detailed" />
                    ) : filteredRentals.length === 0 ? (
                        <RentalListEmpty tab={activeTab} showBrowseLink={activeTab === 'all'} />
                    ) : (
                        <RentalList
                            rentals={filteredRentals}
                            variant="detailed"
                            showActions
                            onAction={handleAction}
                        />
                    )}
                </div>

                <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Rental Reservation?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to cancel this rental? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        {rentalToCancel && (
                            <div className="my-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold">🚗 Vehicle:</span>
                                    <span>{rentalToCancel.carSummary.brand} {rentalToCancel.carSummary.model}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold">📅 Dates:</span>
                                    <span>{new Date(rentalToCancel.startDate).toLocaleDateString()} - {new Date(rentalToCancel.endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold">💰 Total:</span>
                                    <span>${rentalToCancel.totalPrice}</span>
                                </div>
                            </div>
                        )}
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setRentalToCancel(null)}>
                                Keep Rental
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmCancel}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Yes, Cancel Rental
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </ErrorBoundary>
    );
}

