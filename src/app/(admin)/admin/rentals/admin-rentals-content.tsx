'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Breadcrumb } from '@/shared/ui/breadcrumb';
import { PendingRentalsTable, PendingQueueEmpty, AllRentalsTable, useAdminRentals } from '@/features/process-rentals';
import { usePendingApprovals, usePendingPickups, usePendingReturns, useOverdueRentals, useInvalidateAdmin } from '@/features/admin';
import {
    useApproveRental,
    useRejectRental,
    useProcessPickup,
    useProcessReturn,
} from '@/features/process-rentals';
import {
    ALL_STATUSES,
    QUEUES,
    buildAdminRentalsQuery,
    describeEmptyQueues,
    parseAdminRentalsParams,
    queueCount,
    type AdminRentalsView,
    type ProcessReturnData,
    type Queue,
    type QueueFilter,
} from '@/features/process-rentals';
import { showToast } from '@/shared/lib';
import { ErrorMessage } from '@/shared/ui/error-message';
import { PageHeader } from '@/shared/ui/page-header';
import { RENTAL_STATUS_LABELS, RentalStatus } from '@/entities/rental';
import { PAGE_SIZE } from '@/shared/config/constants';
import { ROUTES } from '@/shared/config/routes';

const RENTAL_STATUS_OPTIONS = [
    { value: ALL_STATUSES, label: 'All statuses' },
    ...Object.values(RentalStatus).map((value) => ({ value, label: RENTAL_STATUS_LABELS[value] })),
];

const statusOptions: { value: QueueFilter; label: string }[] = [
    { value: 'all', label: 'All Pending' },
    { value: 'approvals', label: 'Pending Approvals' },
    { value: 'pickups', label: 'Pending Pickups' },
    { value: 'returns', label: 'Pending Returns' },
    { value: 'overdue', label: 'Overdue' },
];

export function AdminRentalsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [initial] = useState(() => parseAdminRentalsParams(searchParams));
    const { userId } = initial;
    const [view, setView] = useState<AdminRentalsView>(initial.view);
    const [rentalsPage, setRentalsPage] = useState(initial.page);
    const [rentalStatus, setRentalStatus] = useState<string>(initial.rentalStatus);
    const serverStatus = rentalStatus !== ALL_STATUSES ? (rentalStatus as RentalStatus) : undefined;
    const allRentals = useAdminRentals({ page: rentalsPage, userId, status: serverStatus });
    const [statusFilter, setStatusFilter] = useState<QueueFilter>(initial.queue);
    const currentQuery = searchParams?.toString() ?? '';

    useEffect(() => {
        const next = buildAdminRentalsQuery({ userId, view, rentalStatus, page: rentalsPage, queue: statusFilter });
        if (next === currentQuery) return;
        router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }, [view, rentalStatus, rentalsPage, statusFilter, userId, currentQuery, pathname, router]);

    const [actionInProgress, setActionInProgress] = useState<number | null>(null);

    const approvalsQuery = usePendingApprovals({ size: PAGE_SIZE.PENDING_QUEUE });
    const pickupsQuery = usePendingPickups({ size: PAGE_SIZE.PENDING_QUEUE });
    const returnsQuery = usePendingReturns({ size: PAGE_SIZE.PENDING_QUEUE });
    const overdueQuery = useOverdueRentals({ size: PAGE_SIZE.PENDING_QUEUE });
    const { data: approvals, isLoading: approvalsLoading } = approvalsQuery;
    const { data: pickups, isLoading: pickupsLoading } = pickupsQuery;
    const { data: returns, isLoading: returnsLoading } = returnsQuery;
    const { data: overdue, isLoading: overdueLoading } = overdueQuery;

    const approveMutation = useApproveRental();
    const rejectMutation = useRejectRental();
    const pickupMutation = useProcessPickup();
    const returnMutation = useProcessReturn();
    const invalidate = useInvalidateAdmin();

    const handleRefresh = () => {
        void invalidate.pending();
        showToast.success('Rentals refreshed');
    };

    const handleApprove = async (rentalId: number, notes?: string) => {
        setActionInProgress(rentalId);
        try {
            await approveMutation.mutateAsync({ rentalId, notes });
        } catch {
        } finally {
            setActionInProgress(null);
        }
    };

    const handleReject = async (rentalId: number, reason: string) => {
        setActionInProgress(rentalId);
        try {
            await rejectMutation.mutateAsync({ rentalId, reason });
        } catch {
        } finally {
            setActionInProgress(null);
        }
    };

    const handlePickup = async (rentalId: number, notes?: string) => {
        setActionInProgress(rentalId);
        try {
            await pickupMutation.mutateAsync({ rentalId, notes });
        } catch {
        } finally {
            setActionInProgress(null);
        }
    };

    const handleReturn = async (rentalId: number, data?: ProcessReturnData) => {
        setActionInProgress(rentalId);
        try {
            await returnMutation.mutateAsync({ rentalId, data });
        } catch {
        } finally {
            setActionInProgress(null);
        }
    };

    const counts = {
        approvals: queueCount(approvals),
        pickups: queueCount(pickups),
        returns: queueCount(returns),
        overdue: queueCount(overdue),
    };

    const failed = {
        approvals: approvalsQuery.isError,
        pickups: pickupsQuery.isError,
        returns: returnsQuery.isError,
        overdue: overdueQuery.isError,
    };
    const anyFailed = Object.values(failed).some(Boolean);
    const countLabel = (hasFailed: boolean, value: number) => (hasFailed ? '?' : value);

    const loadingState: Record<Queue, boolean> = {
        approvals: approvalsLoading,
        pickups: pickupsLoading,
        returns: returnsLoading,
        overdue: overdueLoading,
    };
    const hidesWhenEmpty = (queue: Queue) =>
        statusFilter === 'all' && !loadingState[queue] && !failed[queue] && counts[queue] === 0;
    const emptyQueues = statusFilter === 'all' ? QUEUES.filter((queue) => hidesWhenEmpty(queue.key)) : [];

    const totalPending = counts.approvals + counts.pickups + counts.returns + counts.overdue;

    return (
        <div className="space-y-6">
            <PageHeader
                breadcrumb={
                    <Breadcrumb
                        items={[
                            { label: 'Dashboard', href: ROUTES.admin.dashboard },
                            { label: 'Rental Management' },
                        ]}
                    />
                }
                title="Rental Management"
                description={
                    <>
                        {userId !== undefined ? `Rentals of customer #${userId}` : 'Work the pending queues or browse every rental'}
                    </>
                }
                actions={
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            aria-label="Refresh rentals"
                        >
                            <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </>
                }
            />

            {userId === undefined && (
                <div className="flex gap-2" role="tablist" aria-label="Rental views">
                    <Button role="tab" aria-selected={view === 'pending'} variant={view === 'pending' ? 'default' : 'outline'} onClick={() => setView('pending')}>
                        Pending Work
                    </Button>
                    <Button role="tab" aria-selected={view === 'all-rentals'} variant={view === 'all-rentals' ? 'default' : 'outline'} onClick={() => setView('all-rentals')}>
                        All Rentals
                    </Button>
                </div>
            )}

            {view === 'all-rentals' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <Select
                            value={rentalStatus}
                            onValueChange={(value) => {
                                setRentalStatus(value);
                                setRentalsPage(0);
                            }}
                        >
                            <SelectTrigger className="w-48" aria-label="Filter by status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {RENTAL_STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {userId !== undefined && (
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={ROUTES.admin.rentals}>Show all customers</Link>
                            </Button>
                        )}
                    </div>
                    {allRentals.isError ? (
                        <ErrorMessage
                            title="Failed to load rentals"
                            message="The rental list could not be loaded."
                            onRetry={() => void allRentals.refetch()}
                        />
                    ) : (
                        <AllRentalsTable
                            rentals={allRentals.data?.content ?? []}
                            isLoading={allRentals.isLoading}
                            page={rentalsPage}
                            totalPages={allRentals.data?.totalPages ?? 0}
                            totalElements={allRentals.data?.totalElements ?? 0}
                            onPageChange={setRentalsPage}
                        />
                    )}
                </div>
            )}

            {view === 'pending' && (<>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4" role="group" aria-label="Pending queues">
                {QUEUES.map((queue) => (
                    <button
                        key={queue.key}
                        type="button"
                        aria-pressed={statusFilter === queue.key}
                        onClick={() => setStatusFilter(queue.key)}
                        className={`flex items-center justify-between gap-2 rounded-lg border bg-card px-4 py-3 text-left shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${statusFilter === queue.key ? 'border-primary' : 'border-border'}`}
                    >
                        <span className="text-sm text-muted-foreground">{queue.label}</span>
                        <Badge variant={queue.key === 'overdue' && counts.overdue > 0 ? 'destructive' : counts[queue.key] > 0 ? 'default' : 'secondary'}>
                            {countLabel(failed[queue.key], counts[queue.key])}
                        </Badge>
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as QueueFilter)}
                    >
                        <SelectTrigger aria-label="Filter rentals by status" className="w-48 bg-background border-border hover:bg-accent transition-colors cursor-pointer text-foreground">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <span className="text-sm text-muted-foreground">
                    {anyFailed ? 'Some counts could not be loaded' : `${totalPending} pending items`}
                </span>
            </div>

            <div className="space-y-6">
                {(statusFilter === 'all' || statusFilter === 'approvals') && !hidesWhenEmpty('approvals') && (
                    failed.approvals ? (
                        <ErrorMessage
                            title="Failed to load approvals"
                            message="This list could not be loaded."
                            onRetry={() => void approvalsQuery.refetch()}
                        />
                    ) : (
                        <PendingRentalsTable
                            items={approvals?.content ?? []}
                            total={approvals?.totalElements}
                            type="approvals"
                            isLoading={approvalsLoading}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            actionInProgress={actionInProgress}
                        />
                    )
                )}

                {(statusFilter === 'all' || statusFilter === 'pickups') && !hidesWhenEmpty('pickups') && (
                    failed.pickups ? (
                        <ErrorMessage
                            title="Failed to load pickups"
                            message="This list could not be loaded."
                            onRetry={() => void pickupsQuery.refetch()}
                        />
                    ) : (
                        <PendingRentalsTable
                            items={pickups?.content ?? []}
                            total={pickups?.totalElements}
                            type="pickups"
                            isLoading={pickupsLoading}
                            onPickup={handlePickup}
                            actionInProgress={actionInProgress}
                        />
                    )
                )}

                {(statusFilter === 'all' || statusFilter === 'returns') && !hidesWhenEmpty('returns') && (
                    failed.returns ? (
                        <ErrorMessage
                            title="Failed to load returns"
                            message="This list could not be loaded."
                            onRetry={() => void returnsQuery.refetch()}
                        />
                    ) : (
                        <PendingRentalsTable
                            items={returns?.content ?? []}
                            total={returns?.totalElements}
                            type="returns"
                            isLoading={returnsLoading}
                            onReturn={handleReturn}
                            actionInProgress={actionInProgress}
                        />
                    )
                )}

                {(statusFilter === 'all' || statusFilter === 'overdue') && !hidesWhenEmpty('overdue') && (
                    failed.overdue ? (
                        <ErrorMessage
                            title="Failed to load overdue rentals"
                            message="This list could not be loaded."
                            onRetry={() => void overdueQuery.refetch()}
                        />
                    ) : (
                        <PendingRentalsTable
                            items={overdue?.content ?? []}
                            total={overdue?.totalElements}
                            type="overdue"
                            isLoading={overdueLoading}
                            onReturn={handleReturn}
                            actionInProgress={actionInProgress}
                        />
                    )
                )}

                {emptyQueues.length > 0 && (
                    <PendingQueueEmpty>
                        No pending {describeEmptyQueues(emptyQueues.map((queue) => queue.noun))}.
                    </PendingQueueEmpty>
                )}
            </div>
            </>)}
        </div>
    );
}
