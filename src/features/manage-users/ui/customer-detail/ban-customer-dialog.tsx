'use client';

import { useState } from 'react';
import { Ban, AlertTriangle } from 'lucide-react';
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
import { useSingleFlight } from '@/shared/lib/use-single-flight';
import { useBanUser } from '../../api/users-api';
import type { CustomerStatistics } from '../../model/types';

interface BanCustomerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customerId: number;
    customerName: string;
    statistics: CustomerStatistics;
    onSuccess?: () => void;
}

export function BanCustomerDialog({
    open,
    onOpenChange,
    customerId,
    customerName,
    statistics,
    onSuccess,
}: BanCustomerDialogProps) {
    const [reason, setReason] = useState('');
    const banCustomer = useBanUser();
    const singleFlight = useSingleFlight();

    const handleConfirm = () => {
        if (reason.length < 10) return;

        void singleFlight(async () => {
            try {
                await banCustomer.mutateAsync({ userId: customerId, reason, displayName: customerName });
            } catch {
                return;
            }
            setReason('');
            onOpenChange(false);
            onSuccess?.();
        });
    };

    const handleClose = () => {
        setReason('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md bg-card">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-danger-subtle-foreground">
                        <Ban className="h-5 w-5" />
                        Ban Customer
                    </DialogTitle>
                    <DialogDescription>
                        You are about to ban <strong>{customerName}</strong>. This blocks the customer from logging in and from making new rentals.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-warning-subtle border border-warning-subtle-foreground/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-warning-subtle-foreground flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-warning-subtle-foreground">Customer Statistics</p>
                                <ul className="mt-1 text-warning-subtle-foreground space-y-0.5">
                                    <li>Total Rentals: {statistics.totalRentals}</li>
                                    <li>Damage Reports: {statistics.totalDamageReports}</li>
                                    <li>Late Returns: {statistics.lateReturns}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ban-reason" className="text-muted-foreground">
                            Ban Reason <span className="text-danger-subtle-foreground">*</span>
                        </Label>
                        <Textarea
                            id="ban-reason"
                            placeholder="Enter the reason for banning this customer (min 10 characters)..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[100px]"
                        />
                        <p className="text-xs text-muted-foreground">
                            {reason.length}/10 minimum characters
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={banCustomer.isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={reason.length < 10 || banCustomer.isPending}
                    >
                        <Ban className="h-4 w-4 mr-2" />
                        {banCustomer.isPending ? 'Banning...' : 'Ban Customer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}