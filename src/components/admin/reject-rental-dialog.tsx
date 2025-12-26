'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    AlertTriangle,
    Car,
    User,
    Calendar,
    XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { PendingItem } from '@/types/admin';

interface RejectRentalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: PendingItem | null;
    onReject: (rentalId: number, reason: string) => void;
    isLoading?: boolean;
}

export function RejectRentalDialog({
    open,
    onOpenChange,
    item,
    onReject,
    isLoading = false,
}: RejectRentalDialogProps) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!item) return null;

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError('Please provide a reason for rejection.');
            return;
        }
        setError(null);
        onReject(item.rentalId, reason);
        setReason('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                setReason('');
                setError(null);
            }
            onOpenChange(val);
        }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <DialogTitle className="text-center">Reject Rental Request</DialogTitle>
                    <DialogDescription className="text-center">
                        Are you sure you want to reject this request? This action cannot be undone and the customer will be notified.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{item.carBrand} {item.carModel}</span>
                            </div>
                            <span className="text-[11px] font-bold text-muted-foreground bg-background px-2 py-0.5 rounded border">
                                {item.licensePlate}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{item.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-dashed">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                                {format(new Date(item.startDate), 'MMM d')} - {format(new Date(item.endDate), 'MMM d, yyyy')}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reject-reason" className="text-sm font-semibold flex items-center gap-2">
                            Rejection Reason <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="reject-reason"
                            placeholder="Please explain why this request is being rejected..."
                            className={cn(
                                "h-24 resize-none",
                                error && "border-destructive focus-visible:ring-destructive"
                            )}
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (e.target.value.trim()) setError(null);
                            }}
                        />
                        {error && (
                            <p className="text-[11px] font-medium text-destructive">
                                {error}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        {isLoading ? 'Processing...' : (
                            <>
                                <XCircle className="h-4 w-4" />
                                Reject Request
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
