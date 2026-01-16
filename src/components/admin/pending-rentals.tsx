'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    CheckCircle,
    Clock,
    User,
    Car,
    XCircle,
} from 'lucide-react';
import type { PendingItem } from '@/types';
import type { ProcessReturnData } from '@/types/admin';
import {
    ApproveRentalDialog,
    ProcessPickupDialog,
    ProcessReturnDialog,
    RejectRentalDialog
} from './index';
import { safeFormatDate } from '@/lib/utils/format';


interface PendingRentalsTableProps {
    items: PendingItem[];
    type: 'approvals' | 'pickups' | 'returns' | 'overdue';
    isLoading?: boolean;
    onApprove?: (rentalId: number, notes?: string) => void;
    onReject?: (rentalId: number, reason: string) => void;
    onPickup?: (rentalId: number, notes?: string) => void;
    onReturn?: (rentalId: number, data?: ProcessReturnData) => void;
    onReportDamage?: (rentalId: number) => void;
    actionInProgress?: number | null;
    className?: string;
}

interface PendingRentalsSkeletonProps {
    rows?: number;
    className?: string;
}



function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount);
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'Requested':
            return 'secondary';
        case 'Confirmed':
            return 'default';
        case 'In Use':
            return 'default';
        case 'Overdue':
            return 'destructive';
        default:
            return 'outline';
    }
}


export const PendingRentalsTable = memo(function PendingRentalsTable({
    items,
    type,
    isLoading = false,
    onApprove,
    onReject,
    onPickup,
    onReturn,
    onReportDamage,
    actionInProgress,
    className,
}: PendingRentalsTableProps) {
    const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
    const [dialogState, setDialogState] = useState<{
        type: 'approve' | 'pickup' | 'return' | 'reject' | null;
        open: boolean;
    }>({
        type: null,
        open: false,
    });

    const handleAction = (item: PendingItem, action: 'approve' | 'pickup' | 'return' | 'reject') => {
        setSelectedItem(item);
        setDialogState({ type: action, open: true });
    };

    const handleApproveConfirm = (rentalId: number, notes?: string) => {
        onApprove?.(rentalId, notes);
        setDialogState({ ...dialogState, open: false });
    };

    const handleRejectConfirm = (rentalId: number, reason: string) => {
        onReject?.(rentalId, reason);
        setDialogState({ ...dialogState, open: false });
    };


    const handlePickupConfirm = (rentalId: number, notes?: string) => {
        onPickup?.(rentalId, notes);
    };

    const handleReturnConfirm = (rentalId: number, data?: ProcessReturnData) => {
        onReturn?.(rentalId, data);
    };

    const getActionButton = (item: PendingItem) => {
        const isProcessing = actionInProgress === item.rentalId;

        switch (type) {
            case 'approvals':
                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(item, 'reject')}
                            disabled={isProcessing}
                            className="gap-1 h-8"
                            aria-label={`Reject rental request for ${item.customerName}`}
                        >
                            <XCircle className="h-4 w-4" aria-hidden="true" />
                            Reject
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleAction(item, 'approve')}
                            disabled={isProcessing}
                            className="gap-1 h-8"
                            aria-label={`Approve rental request for ${item.customerName}`}
                        >
                            <CheckCircle className="h-4 w-4" aria-hidden="true" />
                            {isProcessing ? 'Approving...' : 'Approve'}
                        </Button>
                    </div>
                );
            case 'pickups':
                return (
                    <Button
                        size="sm"
                        onClick={() => handleAction(item, 'pickup')}
                        disabled={isProcessing}
                        className="gap-1"
                        aria-label={`Process pickup for ${item.customerName}`}
                    >
                        <Car className="h-4 w-4" aria-hidden="true" />
                        {isProcessing ? 'Processing...' : 'Pickup'}
                    </Button>
                );
            case 'returns':
            case 'overdue':
                return (
                    <Button
                        size="sm"
                        variant={type === 'overdue' ? 'destructive' : 'default'}
                        onClick={() => handleAction(item, 'return')}
                        disabled={isProcessing}
                        className="gap-1"
                        aria-label={`Process return for ${item.customerName}`}
                    >
                        <CheckCircle className="h-4 w-4" aria-hidden="true" />
                        {isProcessing ? 'Processing...' : 'Return'}
                    </Button>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return <PendingRentalsSkeleton className={className} />;
    }

    if (items.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                        No pending {type} at the moment
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className={className}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg capitalize">
                        Pending {type}
                        <Badge variant="secondary" className="ml-2">
                            {items.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    {type === 'overdue' && <TableHead>Late</TableHead>}
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.rentalId}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {item.customerImage ? (
                                                    <div className="relative h-9 w-9">
                                                        <Image
                                                            src={item.customerImage}
                                                            alt={item.customerName}
                                                            fill
                                                            className="rounded-full object-cover border bg-muted shadow-sm"
                                                            sizes="36px"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center border">
                                                        <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm truncate">{item.customerName}</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {item.customerEmail}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {item.carImage ? (
                                                    <div className="relative h-10 w-16">
                                                        <Image
                                                            src={item.carImage}
                                                            alt={`${item.carBrand} ${item.carModel}`}
                                                            fill
                                                            className="rounded-lg object-cover border bg-muted shadow-sm"
                                                            sizes="64px"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-10 w-16 rounded-lg bg-muted flex items-center justify-center border">
                                                        <Car className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm truncate">
                                                        {item.carBrand} {item.carModel}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                                        {item.licensePlate}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm whitespace-nowrap">
                                                <p>{safeFormatDate(item.startDate)}</p>
                                                <p className="text-muted-foreground">
                                                    to {safeFormatDate(item.endDate)}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(item.totalAmount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(item.status)}>
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        {type === 'overdue' && (
                                            <TableCell>
                                                <Badge variant="destructive">
                                                    {item.lateHours}h late
                                                </Badge>
                                            </TableCell>
                                        )}
                                        <TableCell className="text-right">
                                            {getActionButton(item)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <ApproveRentalDialog
                open={dialogState.open && dialogState.type === 'approve'}
                onOpenChange={(open) => setDialogState({ ...dialogState, open })}
                item={selectedItem}
                onApprove={handleApproveConfirm}
                isLoading={actionInProgress !== null}
            />

            <ProcessPickupDialog
                open={dialogState.open && dialogState.type === 'pickup'}
                onOpenChange={(open) => setDialogState({ ...dialogState, open })}
                item={selectedItem}
                onConfirm={handlePickupConfirm}
                isLoading={actionInProgress !== null}
            />

            <ProcessReturnDialog
                open={dialogState.open && dialogState.type === 'return'}
                onOpenChange={(open) => setDialogState({ ...dialogState, open })}
                item={selectedItem}
                onConfirm={handleReturnConfirm}
                onReportDamage={onReportDamage}
                isLoading={actionInProgress !== null}
            />
            <RejectRentalDialog
                open={dialogState.open && dialogState.type === 'reject'}
                onOpenChange={(open) => setDialogState({ ...dialogState, open })}
                item={selectedItem}
                onReject={handleRejectConfirm}
                isLoading={actionInProgress !== null}
            />
        </>
    );
});


export function PendingRentalsSkeleton({ rows = 3, className }: PendingRentalsSkeletonProps) {
    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-8" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
