'use client';

import { useState } from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PendingRentalsTable } from '@/components/admin';
import {
    usePendingApprovals,
    usePendingPickups,
    usePendingReturns,
    useOverdueRentals,
    useApproveRental,
    useRejectRental,
    useProcessPickup,
    useProcessReturn,
    useInvalidateAdmin,
} from '@/lib/hooks/use-admin';
import type { ProcessReturnData } from '@/types';
import { showToast } from '@/lib/utils/toast';

type StatusFilter = 'all' | 'approvals' | 'pickups' | 'returns' | 'overdue';

const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All Pending' },
    { value: 'approvals', label: 'Pending Approvals' },
    { value: 'pickups', label: 'Pending Pickups' },
    { value: 'returns', label: 'Pending Returns' },
    { value: 'overdue', label: 'Overdue' },
];

export default function AdminRentalsPage() {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [actionInProgress, setActionInProgress] = useState<number | null>(null);

    const { data: approvals, isLoading: approvalsLoading } = usePendingApprovals();
    const { data: pickups, isLoading: pickupsLoading } = usePendingPickups();
    const { data: returns, isLoading: returnsLoading } = usePendingReturns();
    const { data: overdue, isLoading: overdueLoading } = useOverdueRentals();

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
        approvals: approvals?.content.length ?? 0,
        pickups: pickups?.content.length ?? 0,
        returns: returns?.content.length ?? 0,
        overdue: overdue?.content.length ?? 0,
    };

    const totalPending = counts.approvals + counts.pickups + counts.returns + counts.overdue;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Rental Management</h1>
                    <p className="text-muted-foreground">
                        Manage all pending rental operations
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card
                    className={`cursor-pointer transition-colors ${statusFilter === 'approvals' ? 'border-primary' : ''}`}
                    onClick={() => setStatusFilter('approvals')}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Approvals</span>
                            <Badge variant={counts.approvals > 0 ? 'default' : 'secondary'}>
                                {counts.approvals}
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
                            <Badge variant="secondary">{counts.pickups}</Badge>
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
                            <Badge variant="secondary">{counts.returns}</Badge>
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
                                {counts.overdue}
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
                        <SelectTrigger className="w-48">
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
                    {totalPending} pending items
                </span>
            </div>

            <div className="space-y-6">
                {(statusFilter === 'all' || statusFilter === 'approvals') && (
                    <PendingRentalsTable
                        items={approvals?.content ?? []}
                        type="approvals"
                        isLoading={approvalsLoading}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        actionInProgress={actionInProgress}
                    />
                )}

                {(statusFilter === 'all' || statusFilter === 'pickups') && (
                    <PendingRentalsTable
                        items={pickups?.content ?? []}
                        type="pickups"
                        isLoading={pickupsLoading}
                        onPickup={handlePickup}
                        actionInProgress={actionInProgress}
                    />
                )}

                {(statusFilter === 'all' || statusFilter === 'returns') && (
                    <PendingRentalsTable
                        items={returns?.content ?? []}
                        type="returns"
                        isLoading={returnsLoading}
                        onReturn={handleReturn}
                        actionInProgress={actionInProgress}
                    />
                )}

                {(statusFilter === 'all' || statusFilter === 'overdue') && (
                    <PendingRentalsTable
                        items={overdue?.content ?? []}
                        type="overdue"
                        isLoading={overdueLoading}
                        onReturn={handleReturn}
                        actionInProgress={actionInProgress}
                    />
                )}
            </div>
        </div>
    );
}
