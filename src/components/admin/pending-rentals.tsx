'use client';

import { memo, useState } from 'react';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, Clock, User, Car } from 'lucide-react';
import type { PendingItem } from '@/types';


interface PendingRentalsTableProps {
    items: PendingItem[];
    type: 'approvals' | 'pickups' | 'returns' | 'overdue';
    isLoading?: boolean;
    onApprove?: (rentalId: number) => void;
    onPickup?: (rentalId: number) => void;
    onReturn?: (rentalId: number) => void;
    actionInProgress?: number | null;
    className?: string;
}

interface PendingRentalsSkeletonProps {
    rows?: number;
    className?: string;
}

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
    isLoading?: boolean;
    variant?: 'default' | 'destructive';
}


function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
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


function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    onConfirm,
    isLoading = false,
    variant = 'default',
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export const PendingRentalsTable = memo(function PendingRentalsTable({
    items,
    type,
    isLoading = false,
    onApprove,
    onPickup,
    onReturn,
    actionInProgress,
    className,
}: PendingRentalsTableProps) {
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        rentalId: number | null;
        action: 'approve' | 'pickup' | 'return' | null;
    }>({
        open: false,
        rentalId: null,
        action: null,
    });

    const handleAction = (rentalId: number, action: 'approve' | 'pickup' | 'return') => {
        setConfirmDialog({ open: true, rentalId, action });
    };

    const handleConfirm = () => {
        if (!confirmDialog.rentalId || !confirmDialog.action) return;

        switch (confirmDialog.action) {
            case 'approve':
                onApprove?.(confirmDialog.rentalId);
                break;
            case 'pickup':
                onPickup?.(confirmDialog.rentalId);
                break;
            case 'return':
                onReturn?.(confirmDialog.rentalId);
                break;
        }
        setConfirmDialog({ open: false, rentalId: null, action: null });
    };

    const getDialogContent = () => {
        switch (confirmDialog.action) {
            case 'approve':
                return {
                    title: 'Approve Rental',
                    description: 'Are you sure you want to approve this rental request? The customer will be notified.',
                    confirmLabel: 'Approve',
                };
            case 'pickup':
                return {
                    title: 'Confirm Pickup',
                    description: 'Confirm that the customer has picked up the vehicle?',
                    confirmLabel: 'Confirm Pickup',
                };
            case 'return':
                return {
                    title: 'Process Return',
                    description: 'Confirm that the vehicle has been returned?',
                    confirmLabel: 'Process Return',
                };
            default:
                return { title: '', description: '', confirmLabel: '' };
        }
    };

    const getActionButton = (item: PendingItem) => {
        const isProcessing = actionInProgress === item.rentalId;

        switch (type) {
            case 'approvals':
                return (
                    <Button
                        size="sm"
                        onClick={() => handleAction(item.rentalId, 'approve')}
                        disabled={isProcessing}
                        className="gap-1"
                    >
                        <CheckCircle className="h-4 w-4" />
                        {isProcessing ? 'Approving...' : 'Approve'}
                    </Button>
                );
            case 'pickups':
                return (
                    <Button
                        size="sm"
                        onClick={() => handleAction(item.rentalId, 'pickup')}
                        disabled={isProcessing}
                        className="gap-1"
                    >
                        <Car className="h-4 w-4" />
                        {isProcessing ? 'Processing...' : 'Pickup'}
                    </Button>
                );
            case 'returns':
            case 'overdue':
                return (
                    <Button
                        size="sm"
                        variant={type === 'overdue' ? 'destructive' : 'default'}
                        onClick={() => handleAction(item.rentalId, 'return')}
                        disabled={isProcessing}
                        className="gap-1"
                    >
                        <CheckCircle className="h-4 w-4" />
                        {isProcessing ? 'Processing...' : 'Return'}
                    </Button>
                );
            default:
                return null;
        }
    };

    const dialogContent = getDialogContent();

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
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{item.customerName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.customerEmail}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">
                                                {item.carBrand} {item.carModel}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.licensePlate}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <p>{formatDate(item.startDate)}</p>
                                            <p className="text-muted-foreground">
                                                to {formatDate(item.endDate)}
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
                </CardContent>
            </Card>

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) =>
                    setConfirmDialog({ ...confirmDialog, open })
                }
                title={dialogContent.title}
                description={dialogContent.description}
                confirmLabel={dialogContent.confirmLabel}
                onConfirm={handleConfirm}
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
