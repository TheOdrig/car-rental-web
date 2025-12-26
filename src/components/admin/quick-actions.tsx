'use client';

import React, { memo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Car, RotateCcw, CheckCircle, AlertTriangle, User} from 'lucide-react';
import type { PendingItem } from '@/types/admin';


interface QuickActionsCardProps {
    className?: string;
    onPickup?: (rentalId: number, notes?: string) => void;
    onReturn?: (rentalId: number, notes?: string) => void;
    pickupItems?: PendingItem[];
    returnItems?: PendingItem[];
    isLoading?: boolean;
    actionInProgress?: number | null;
}

interface ActionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'pickup' | 'return';
    item: PendingItem | null;
    onConfirm: (notes: string) => void;
    isLoading?: boolean;
}

interface QuickActionButtonProps {
    label: string;
    icon: React.ReactNode;
    count: number;
    variant?: 'default' | 'outline' | 'secondary';
    onClick: () => void;
    disabled?: boolean;
}


function ActionDialog({
    open,
    onOpenChange,
    type,
    item,
    onConfirm,
    isLoading = false,
}: ActionDialogProps) {
    const [notes, setNotes] = useState('');

    const handleConfirm = () => {
        onConfirm(notes);
        setNotes('');
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setNotes('');
        }
        onOpenChange(newOpen);
    };

    const isPickup = type === 'pickup';
    const title = isPickup ? 'Confirm Vehicle Pickup' : 'Process Vehicle Return';
    const description = isPickup
        ? 'Confirm that the customer has picked up the vehicle. Add any notes about the vehicle condition.'
        : 'Confirm that the vehicle has been returned. Add any notes about damage or issues.';
    const confirmLabel = isPickup ? 'Confirm Pickup' : 'Process Return';
    const notesPlaceholder = isPickup
        ? 'e.g., Fuel level full, no visible damage, customer verified ID...'
        : 'e.g., Minor scratch on rear bumper, fuel level 3/4, interior clean...';

    if (!item) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isPickup ? (
                            <Car className="h-5 w-5 text-primary" />
                        ) : (
                            <RotateCcw className="h-5 w-5 text-primary" />
                        )}
                        {title}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="rounded-lg border bg-muted/50 p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Customer</p>
                                <p className="font-medium">{item.customerName}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Vehicle</p>
                                <p className="font-medium">
                                    {item.carBrand} {item.carModel}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">License Plate</p>
                                <p className="font-medium">{item.licensePlate}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Rental ID</p>
                                <p className="font-medium">#{item.rentalId}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">
                            Notes <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={notesPlaceholder}
                            rows={3}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? 'Processing...' : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


function QuickActionButton({
    label,
    icon,
    count,
    variant = 'default',
    onClick,
    disabled = false,
}: QuickActionButtonProps) {
    return (
        <Button
            variant={variant}
            className="h-auto flex-col gap-2 py-4 px-6"
            onClick={onClick}
            disabled={disabled || count === 0}
        >
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-2xl font-bold">{count}</span>
            </div>
            <span className="text-sm font-medium">{label}</span>
        </Button>
    );
}


export const QuickActionsCard = memo(function QuickActionsCard({
    className,
    onPickup,
    onReturn,
    pickupItems = [],
    returnItems = [],
    isLoading = false,
    actionInProgress,
}: QuickActionsCardProps) {
    const [dialog, setDialog] = useState<{
        open: boolean;
        type: 'pickup' | 'return';
        item: PendingItem | null;
    }>({
        open: false,
        type: 'pickup',
        item: null,
    });

    const handleOpenDialog = (type: 'pickup' | 'return') => {
        const items = type === 'pickup' ? pickupItems : returnItems;
        if (items.length > 0) {
            setDialog({ open: true, type, item: items[0] });
        }
    };

    const handleConfirm = (notes: string) => {
        if (!dialog.item) return;

        if (dialog.type === 'pickup') {
            onPickup?.(dialog.item.rentalId, notes || undefined);
        } else {
            onReturn?.(dialog.item.rentalId, notes || undefined);
        }

        setDialog({ open: false, type: 'pickup', item: null });
    };

    if (isLoading) {
        return <QuickActionsSkeleton className={className} />;
    }

    const hasOverdue = returnItems.some((item) => item.lateHours && item.lateHours > 0);

    return (
        <>
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    <CardDescription>
                        Process pickups and returns quickly
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {pickupItems.length === 0 && returnItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-xl border border-dashed">
                            <CheckCircle className="h-8 w-8 text-green-500 mb-2 opacity-50" />
                            <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
                            <p className="text-xs text-muted-foreground">No pending pickups or returns.</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-4">
                            <QuickActionButton
                                label="Pending Pickups"
                                icon={<Car className="h-5 w-5" />}
                                count={pickupItems.length}
                                onClick={() => handleOpenDialog('pickup')}
                                disabled={actionInProgress !== null}
                            />
                            <QuickActionButton
                                label="Pending Returns"
                                icon={<RotateCcw className="h-5 w-5" />}
                                count={returnItems.length}
                                variant={hasOverdue ? 'default' : 'outline'}
                                onClick={() => handleOpenDialog('return')}
                                disabled={actionInProgress !== null}
                            />
                        </div>
                    )}

                    {hasOverdue && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive border border-destructive/20 animate-pulse">
                            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                            <span className="text-[13px] font-semibold">
                                Critical: Some returns are overdue
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ActionDialog
                open={dialog.open}
                onOpenChange={(open) => setDialog({ ...dialog, open })}
                type={dialog.type}
                item={dialog.item}
                onConfirm={handleConfirm}
                isLoading={actionInProgress !== null}
            />
        </>
    );
});


interface QuickActionItemProps {
    item: PendingItem;
    type: 'pickup' | 'return';
    onAction: (rentalId: number) => void;
    isProcessing?: boolean;
}

export const QuickActionItem = memo(function QuickActionItem({
    item,
    type,
    onAction,
    isProcessing = false,
}: QuickActionItemProps) {
    const isOverdue = item.lateHours && item.lateHours > 0;

    return (
        <div
            className={cn(
                'flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-sm',
                isOverdue ? 'border-destructive/40 bg-destructive/5' : 'bg-card'
            )}
        >
            <div className="flex items-center gap-4 min-w-0">
                <div className="relative shrink-0">
                    {item.customerImage ? (
                        <img
                            src={item.customerImage}
                            alt={item.customerName}
                            className="h-10 w-10 rounded-full object-cover border bg-muted"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border">
                            <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                    )}
                    {item.carImage && (
                        <div className="absolute -bottom-1 -right-1 h-6 w-9 rounded-md border-2 border-background overflow-hidden bg-muted shadow-sm">
                            <img
                                src={item.carImage}
                                alt={item.carBrand}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                        {item.carBrand} {item.carModel}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {item.customerName} • <span className="font-mono">{item.licensePlate}</span>
                    </p>
                    {isOverdue && (
                        <p className="text-[11px] font-bold text-destructive mt-0.5 uppercase tracking-wide">
                            {item.lateHours}h overdue
                        </p>
                    )}
                </div>
            </div>
            <Button
                size="sm"
                variant={isOverdue ? 'destructive' : 'default'}
                onClick={() => onAction(item.rentalId)}
                disabled={isProcessing}
                className="gap-1"
            >
                {type === 'pickup' ? (
                    <>
                        <Car className="h-4 w-4" />
                        {isProcessing ? 'Processing...' : 'Pickup'}
                    </>
                ) : (
                    <>
                        <CheckCircle className="h-4 w-4" />
                        {isProcessing ? 'Processing...' : 'Return'}
                    </>
                )}
            </Button>
        </div>
    );
});


interface QuickActionsSkeletonProps {
    className?: string;
}

export function QuickActionsSkeleton({ className }: QuickActionsSkeletonProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    <Skeleton className="h-20 w-32" />
                    <Skeleton className="h-20 w-32" />
                </div>
            </CardContent>
        </Card>
    );
}
