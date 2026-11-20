'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import {
    AlertTriangle,
    Car,
    User,
    Calendar,
    XCircle
} from 'lucide-react';
import { cn, formatDate, formatShortDate } from '@/shared/lib';
import type { PendingItem } from '@/entities/rental';

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
            <DialogContent className="max-w-md bg-card border-border shadow-2xl overflow-hidden">

                <DialogHeader className="pt-2">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-subtle mb-4 shadow-sm border border-danger-subtle-foreground/30">
                        <AlertTriangle className="h-7 w-7 text-danger-subtle-foreground" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Reject Rental Request
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground px-4">
                        This action will inform the customer that their request has been declined. This cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="rounded-lg border border-border bg-raised p-5 space-y-4 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Car className="h-10 w-10 text-foreground" />
                        </div>

                        <div className="flex items-center justify-between gap-4 relative z-10">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-popover border border-border shadow-sm text-muted-foreground">
                                    <Car className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-bold text-foreground truncate">
                                    {item.carBrand} {item.carModel}
                                </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold tracking-tighter text-muted-foreground bg-muted px-2 py-0.5 rounded border border-transparent">
                                {item.licensePlate}
                            </span>
                        </div>

                        <div className="flex items-center gap-2.5 relative z-10">
                            <div className="p-1.5 rounded-lg bg-popover border border-border shadow-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                            </div>
                            <span className="text-sm text-muted-foreground font-medium">{item.customerName}</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-xs text-muted-foreground pt-3 border-t border-border relative z-10">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="font-medium tracking-tight">
                                {formatShortDate(item.startDate)} - {formatDate(item.endDate)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="reject-reason" className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                            Rejection Reason <span className="text-danger-subtle-foreground">*</span>
                        </Label>
                        <Textarea
                            id="reject-reason"
                            placeholder="Please explain the reason for rejection (this will be sent to the customer)..."
                            className={cn(
                                "h-32 resize-none bg-raised border-border focus-visible:ring-ring placeholder:text-muted-foreground transition-all rounded-xl",
                                error && "border-destructive"
                            )}
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (e.target.value.trim()) setError(null);
                            }}
                        />
                        {error && (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-danger-subtle-foreground animate-in fade-in slide-in-from-top-1">
                                <AlertTriangle className="h-3 w-3" />
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-3 sm:gap-3 p-2 bg-raised -mx-6 -mb-6 mt-2 border-t border-border">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="font-semibold text-muted-foreground hover:bg-accent"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-destructive hover:bg-destructive text-destructive-foreground font-semibold h-11 px-6 gap-2"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Rejecting...
                            </div>
                        ) : (
                            <>
                                <XCircle className="h-5 w-5" />
                                Reject Request
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}