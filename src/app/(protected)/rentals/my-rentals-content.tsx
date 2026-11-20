'use client';

import { useState, useMemo, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, Car, Wallet } from 'lucide-react';
import { logger, formatCurrencyWithDecimals, formatDate } from '@/shared/lib';
import { useAllMyRentals, useCancelRental } from '@/entities/rental';
import { Pagination } from '@/shared/ui/pagination';
import { ErrorMessage } from '@/shared/ui/error-message';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorBoundary } from '@/shared/ui/error-boundary';
import { PageHeader } from '@/shared/ui/page-header';
import {
    RentalList,
    RentalListSkeleton,
    RentalListEmpty,
    RentalStats,
    RentalTabs,
} from '@/features/manage-rentals';
import type { RentalTab, Rental } from '@/entities/rental';
import { getRentalsByTab, calculateTabCounts, calculateRentalStats, parseRentalTab } from '@/entities/rental';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/ui/alert-dialog';

const PAGE_SIZE = 10;

export function MyRentalsContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data, isLoading, isError, refetch } = useAllMyRentals();
    const cancelMutation = useCancelRental();
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [rentalToCancel, setRentalToCancel] = useState<Rental | null>(null);
    const activeTab = parseRentalTab(searchParams?.get('tab'));
    const pageParam = Number.parseInt(searchParams?.get('page') ?? '', 10);
    const page = Number.isFinite(pageParam) && pageParam > 1 ? pageParam - 1 : 0;

    const goTo = useCallback(
        (tab: RentalTab, pageIndex: number) => {
            const params = new URLSearchParams();
            if (tab !== 'all') params.set('tab', tab);
            if (pageIndex > 0) params.set('page', String(pageIndex + 1));
            const query = params.toString();
            router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
        },
        [router, pathname]
    );

    const rentals = useMemo(() => data ?? [], [data]);

    const tabCounts = useMemo(() => calculateTabCounts(rentals), [rentals]);

    const stats = useMemo(() => calculateRentalStats(rentals), [rentals]);

    const filteredRentals = useMemo(
        () => getRentalsByTab(rentals, activeTab),
        [rentals, activeTab]
    );

    const totalPages = Math.max(1, Math.ceil(filteredRentals.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages - 1);
    const pagedRentals = useMemo(
        () => filteredRentals.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE),
        [filteredRentals, currentPage]
    );

    const handleTabChange = useCallback((tab: RentalTab) => goTo(tab, 0), [goTo]);

    const handlePageChange = useCallback((pageIndex: number) => goTo(activeTab, pageIndex), [goTo, activeTab]);

    const handleAction = useCallback((action: string, rental: Rental) => {
        switch (action) {
            case 'view':
                router.push(`/rentals/${rental.id}`);
                break;
            case 'pay':
                router.push(`/rentals/${rental.id}/pay`);
                break;
            case 'book-again':
                if (rental.carSummary?.id) {
                    router.push(`/cars/${rental.carSummary.id}`);
                }
                break;
            case 'cancel':
                setRentalToCancel(rental);
                setCancelDialogOpen(true);
                break;
            default:
                logger.warn(`Unknown action: ${action}`);
        }
    }, [router]);

    const handleConfirmCancel = useCallback(() => {
        if (rentalToCancel) {
            cancelMutation.mutate(rentalToCancel.id);
            setCancelDialogOpen(false);
            setRentalToCancel(null);
        }
    }, [rentalToCancel, cancelMutation]);

    if (isError) {
        return (
            <div className="container py-8">
                <ErrorMessage
                    title="Failed to load rentals"
                    message="Your rentals could not be loaded. Check your connection and try again."
                    onRetry={() => void refetch()}
                />
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="container py-8">
                <PageHeader area="customer" className="mb-8" title="My Rentals" description="View and manage your rental history" />

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
                        <>
                            <RentalList
                                rentals={pagedRentals}
                                variant="detailed"
                                showActions
                                onAction={handleAction}
                            />
                            <Pagination
                                className="mt-6"
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </>
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
                            <div className="my-4 rounded-lg border border-border bg-raised p-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Car className="h-4 w-4" aria-hidden="true" />
                                    <span className="font-semibold">Vehicle:</span>
                                    <span>{rentalToCancel.carSummary?.brand} {rentalToCancel.carSummary?.model}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                                    <span className="font-semibold">Dates:</span>
                                    <span>{formatDate(rentalToCancel.startDate)} - {formatDate(rentalToCancel.endDate)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Wallet className="h-4 w-4" aria-hidden="true" />
                                    <span className="font-semibold">Total:</span>
                                    <span>{formatCurrencyWithDecimals(rentalToCancel.totalPrice, rentalToCancel.currency ?? 'USD')}</span>
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
