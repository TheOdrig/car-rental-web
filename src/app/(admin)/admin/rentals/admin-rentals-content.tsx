'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Breadcrumb } from '@/widgets/layout';
import { PendingRentalsTable, AllRentalsTable, useAdminRentals } from '@/features/process-rentals';
import { usePendingApprovals, usePendingPickups, usePendingReturns, useOverdueRentals, useInvalidateAdmin } from '@/features/admin';
import {
    useApproveRental,
    useRejectRental,
    useProcessPickup,
    useProcessReturn,
} from '@/features/process-rentals';
import type { ProcessReturnData } from '@/features/process-rentals';
import { showToast } from '@/shared/lib';
import { ErrorMessage } from '@/shared/ui/error-message';
import { RENTAL_STATUS_LABELS, RentalStatus } from '@/entities/rental';

type StatusFilter = 'all' | 'approvals' | 'pickups' | 'returns' | 'overdue';
type View = 'pending' | 'all-rentals';

const PENDING_PAGE_SIZE = 50;

const ALL_STATUSES = 'all';

const RENTAL_STATUS_OPTIONS = [
    { value: ALL_STATUSES, label: 'All statuses' },
    ...Object.values(RentalStatus).map((value) => ({ value, label: RENTAL_STATUS_LABELS[value] })),
];

const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All Pending' },
    { value: 'approvals', label: 'Pending Approvals' },
    { value: 'pickups', label: 'Pending Pickups' },
    { value: 'returns', label: 'Pending Returns' },
    { value: 'overdue', label: 'Overdue' },
];

const QUEUE_FILTERS: StatusFilter[] = ['approvals', 'pickups', 'returns', 'overdue'];

export function AdminRentalsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const userIdParam = searchParams?.get('userId');
    const userId = userIdParam && /^[0-9]+$/.test(userIdParam) ? Number(userIdParam) : undefined;
    const statusParam = searchParams?.get('status') ?? '';
    const queueParam = searchParams?.get('queue') ?? '';
    const pageParam = Number.parseInt(searchParams?.get('page') ?? '', 10);
    const [view, setView] = useState<View>(
        userId !== undefined || searchParams?.get('view') === 'all' ? 'all-rentals' : 'pending'
    );
    const [rentalsPage, setRentalsPage] = useState(Number.isFinite(pageParam) && pageParam > 1 ? pageParam - 1 : 0);
    const [rentalStatus, setRentalStatus] = useState<string>(
        (Object.values(RentalStatus) as string[]).includes(statusParam) ? statusParam : ALL_STATUSES
    );
    const serverStatus = rentalStatus !== ALL_STATUSES ? (rentalStatus as RentalStatus) : undefined;
    const allRentals = useAdminRentals({ page: rentalsPage, userId, status: serverStatus });
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(
        (QUEUE_FILTERS as string[]).includes(queueParam) ? (queueParam as StatusFilter) : 'all'
    );
    const currentQuery = searchParams?.toString() ?? '';

    useEffect(() => {
        const params = new URLSearchParams();
        if (userId !== undefined) params.set('userId', String(userId));
        if (view === 'all-rentals' && userId === undefined) params.set('view', 'all');
        if (view === 'all-rentals' && rentalStatus !== ALL_STATUSES) params.set('status', rentalStatus);
        if (view === 'all-rentals' && rentalsPage > 0) params.set('page', String(rentalsPage + 1));
        if (view === 'pending' && statusFilter !== 'all') params.set('queue', statusFilter);
        const next = params.toString();
        if (next === currentQuery) return;
        router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }, [view, rentalStatus, rentalsPage, statusFilter, userId, currentQuery, pathname, router]);

    const [actionInProgress, setActionInProgress] = useState<number | null>(null);

    const approvalsQuery = usePendingApprovals({ size: PENDING_PAGE_SIZE });
    const pickupsQuery = usePendingPickups({ size: PENDING_PAGE_SIZE });
    const returnsQuery = usePendingReturns({ size: PENDING_PAGE_SIZE });
    const overdueQuery = useOverdueRentals({ size: PENDING_PAGE_SIZE });
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
        approvals: approvals?.totalElements ?? approvals?.content.length ?? 0,
        pickups: pickups?.totalElements ?? pickups?.content.length ?? 0,
        returns: returns?.totalElements ?? returns?.content.length ?? 0,
        overdue: overdue?.totalElements ?? overdue?.content.length ?? 0,
    };

    const failed = {
        approvals: approvalsQuery.isError,
        pickups: pickupsQuery.isError,
        returns: returnsQuery.isError,
        overdue: overdueQuery.isError,
    };
    const anyFailed = Object.values(failed).some(Boolean);
    const countLabel = (hasFailed: boolean, value: number) => (hasFailed ? '?' : value);

    const totalPending = counts.approvals + counts.pickups + counts.returns + counts.overdue;

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/admin/dashboard' },
                    { label: 'Rental Management' },
                ]}
            />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Rental Management</h1>
                    <p className="text-muted-foreground">
                        {userId !== undefined ? `Rentals of customer #${userId}` : 'Work the pending queues or browse every rental'}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    aria-label="Refresh rentals"
                >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                </Button>
            </div>

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
                                <Link href="/admin/rentals">Show all customers</Link>
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
            <div className="grid gap-4 md:grid-cols-4">
                <Card
                    className={`cursor-pointer transition-colors ${statusFilter === 'approvals' ? 'border-primary' : ''}`}
                    onClick={() => setStatusFilter('approvals')}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Approvals</span>
                            <Badge variant={counts.approvals > 0 ? 'default' : 'secondary'}>
                                {countLabel(failed.approvals, counts.approvals)}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card
                    className={`cursor-pointer transition-colors ${statusFilter === 'pickups' ? 'border-primary' : ''}`}
                    onClick={() => setStatusFilter('pickups')}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Pickups</span>
                            <Badge variant="secondary">{countLabel(failed.pickups, counts.pickups)}</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card
                    className={`cursor-pointer transition-colors ${statusFilter === 'returns' ? 'border-primary' : ''}`}
                    onClick={() => setStatusFilter('returns')}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Returns</span>
                            <Badge variant="secondary">{countLabel(failed.returns, counts.returns)}</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card
                    className={`cursor-pointer transition-colors ${statusFilter === 'overdue' ? 'border-primary' : ''}`}
                    onClick={() => setStatusFilter('overdue')}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Overdue</span>
                            <Badge variant={counts.overdue > 0 ? 'destructive' : 'secondary'}>
                                {countLabel(failed.overdue, counts.overdue)}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                    >
                        <SelectTrigger aria-label="Filter rentals by status" className="w-48 bg-background border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-900 dark:text-slate-100">
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
                {(statusFilter === 'all' || statusFilter === 'approvals') && (
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

                {(statusFilter === 'all' || statusFilter === 'pickups') && (
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

                {(statusFilter === 'all' || statusFilter === 'returns') && (
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

                {(statusFilter === 'all' || statusFilter === 'overdue') && (
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
            </div>
            </>)}
        </div>
    );
}
