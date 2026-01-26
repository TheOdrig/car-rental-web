'use client';

import { useState } from 'react';
import { UserCheck, Clock } from 'lucide-react';
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
import { useUnbanCustomer } from '@/lib/hooks/use-admin';
import { safeFormatDate } from '@/lib/utils/format';
import type { CustomerAccountStatus } from '@/types';

interface UnbanCustomerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customerId: number;
    customerName: string;
    accountStatus: CustomerAccountStatus;
    onSuccess?: () => void;
}

export function UnbanCustomerDialog({
    open,
    onOpenChange,
    customerId,
    customerName,
    accountStatus,
    onSuccess,
}: UnbanCustomerDialogProps) {
    const [note, setNote] = useState('');
    const unbanCustomer = useUnbanCustomer();

    const handleConfirm = () => {
        unbanCustomer.mutate(
            { userId: customerId, note: note.trim() || undefined },
            {
                onSuccess: () => {
                    setNote('');
                    onOpenChange(false);
                    onSuccess?.();
                },
            }
        );
    };

    const handleClose = () => {
        setNote('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md bg-white dark:bg-slate-900">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <UserCheck className="h-5 w-5" />
                        Unban Customer
                    </DialogTitle>
                    <DialogDescription>
                        You are about to unban <strong>{customerName}</strong>. This will restore their ability to make rentals.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block">Original Ban Reason</span>
                            <p className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                                {accountStatus.banReason || 'No reason provided'}
                            </p>
                        </div>
                        {accountStatus.bannedAt && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Clock className="h-4 w-4" />
                                <span>Banned on: {safeFormatDate(accountStatus.bannedAt, 'datetime')}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="unban-note" className="text-slate-700 dark:text-slate-300">
                            Unban Note (Optional)
                        </Label>
                        <Textarea
                            id="unban-note"
                            placeholder="Add an optional note about why you're unbanning this customer..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={unbanCustomer.isPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={unbanCustomer.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        <UserCheck className="h-4 w-4 mr-2" />
                        {unbanCustomer.isPending ? 'Unbanning...' : 'Unban Customer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

