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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useBanCustomer } from '@/lib/hooks/use-admin';
import type { CustomerStatistics } from '@/types';

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
    const banCustomer = useBanCustomer();

    const handleConfirm = () => {
        if (reason.length < 10) return;

        banCustomer.mutate(
            { userId: customerId, reason },
            {
                onSuccess: () => {
                    setReason('');
                    onOpenChange(false);
                    onSuccess?.();
                },
            }
        );
    };

    const handleClose = () => {
        setReason('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md bg-white dark:bg-slate-900">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <Ban className="h-5 w-5" />
                        Ban Customer
                    </DialogTitle>
                    <DialogDescription>
                        You are about to ban <strong>{customerName}</strong>. This action will prevent the customer from making new rentals.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-amber-800 dark:text-amber-200">Customer Statistics</p>
                                <ul className="mt-1 text-amber-700 dark:text-amber-300 space-y-0.5">
                                    <li>Total Rentals: {statistics.totalRentals}</li>
                                    <li>Damage Reports: {statistics.totalDamageReports}</li>
                                    <li>Late Returns: {statistics.lateReturns}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ban-reason" className="text-slate-700 dark:text-slate-300">
                            Ban Reason <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="ban-reason"
                            placeholder="Enter the reason for banning this customer (min 10 characters)..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[100px]"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
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
