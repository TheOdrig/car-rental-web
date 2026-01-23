'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { DynamicImage } from '@/components/ui/dynamic-image';
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
    RejectRentalDialog,
    DamageReportForm
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

const statusConfig: Record<string, { label: string; className: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    REQUESTED: {
        label: 'Requested',
        variant: 'secondary',
        className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800',
    },
    CONFIRMED: {
        label: 'Confirmed',
        variant: 'default',
        className: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    },
    IN_USE: {
        label: 'In Use',
        variant: 'secondary',
        className: 'bg-violet-500 hover:bg-violet-600 text-white',
    },
    OVERDUE: {
        label: 'Overdue',
        variant: 'destructive',
        className: 'bg-rose-500 hover:bg-rose-600 text-white',
    },
    CANCELLED: {
        label: 'Cancelled',
        variant: 'outline',
        className: 'text-slate-500 border-slate-200 dark:border-slate-800',
    },
    RETURNED: {
        label: 'Returned',
        variant: 'default',
        className: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    },
};

function getStatusDisplay(status: string) {
    const s = status?.toUpperCase();
    return statusConfig[s] || {
        label: status,
        variant: 'outline' as const,
        className: '',
    };
}


export const PendingRentalsTable = memo(function PendingRentalsTable({
    items,
    type,
    isLoading = false,
    onApprove,
    onReject,
    onPickup,
    onReturn,
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
    const [damageDialogOpen, setDamageDialogOpen] = useState(false);
    const [damageRentalId, setDamageRentalId] = useState<number | null>(null);

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
                        className="gap-1 cursor-pointer"
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
                                <TableRow className="border-b border-slate-200 dark:border-slate-700">
                                    <TableHead className="text-slate-600 dark:text-slate-300 font-semibold">Customer</TableHead>
                                    <TableHead className="text-slate-600 dark:text-slate-300 font-semibold">Vehicle</TableHead>
                                    <TableHead className="text-slate-600 dark:text-slate-300 font-semibold">Dates</TableHead>
                                    <TableHead className="text-slate-600 dark:text-slate-300 font-semibold">Amount</TableHead>
                                    <TableHead className="text-slate-600 dark:text-slate-300 font-semibold">Status</TableHead>
                                    {type === 'overdue' && <TableHead className="text-slate-600 dark:text-slate-300 font-semibold">Late</TableHead>}
                                    <TableHead className="text-right text-slate-600 dark:text-slate-300 font-semibold">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.rentalId}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {item.customerImage ? (
                                                    <div className="relative h-9 w-9">
                                                        <DynamicImage
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
                                                    {item.customerId && item.customerId > 0 ? (
                                                        <Link
                                                            href={`/admin/users/${item.customerId}`}
                                                            className="font-semibold text-sm truncate hover:text-primary hover:underline transition-colors block"
                                                        >
                                                            {item.customerName}
                                                        </Link>
                                                    ) : (
                                                        <span className="font-semibold text-sm truncate block">
                                                            {item.customerName}
                                                        </span>
                                                    )}
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
                                                        <DynamicImage
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
                                                    <Link
                                                        href={`/admin/fleet/${item.carId}`}
                                                        className="font-semibold text-sm truncate hover:text-primary hover:underline transition-colors block"
                                                    >
                                                        {item.carBrand} {item.carModel}
                                                    </Link>
                                                    <Link
                                                        href={`/admin/rentals/${item.rentalId}`}
                                                        className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight hover:text-primary transition-colors block"
                                                    >
                                                        {item.licensePlate} • CR-{String(item.rentalId).padStart(4, '0')}
                                                    </Link>
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
                                            {(() => {
                                                const display = getStatusDisplay(item.status);
                                                return (
                                                    <Badge variant={display.variant} className={display.className}>
                                                        {display.label}
                                                    </Badge>
                                                );
                                            })()}
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
                onReportDamage={(rentalId) => {
                    setDamageRentalId(rentalId);
                    setDamageDialogOpen(true);
                    setDialogState({ ...dialogState, open: false });
                }}
                isLoading={actionInProgress !== null}
            />
            <RejectRentalDialog
                open={dialogState.open && dialogState.type === 'reject'}
                onOpenChange={(open) => setDialogState({ ...dialogState, open })}
                item={selectedItem}
                onReject={handleRejectConfirm}
                isLoading={actionInProgress !== null}
            />
            {damageRentalId && (
                <DamageReportForm
                    rentalId={damageRentalId}
                    open={damageDialogOpen}
                    onOpenChange={setDamageDialogOpen}
                    onSuccess={() => {
                        setDamageRentalId(null);
                    }}
                />
            )}
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
