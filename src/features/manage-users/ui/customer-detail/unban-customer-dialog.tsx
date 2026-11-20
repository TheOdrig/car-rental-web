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
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { useSingleFlight } from '@/shared/lib/use-single-flight';
import { useUnbanUser } from '../../api/users-api';
import { formatDateTime } from '@/shared/lib';
import type { CustomerAccountStatus } from '@/entities/user';

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
    const unbanCustomer = useUnbanUser();
    const singleFlight = useSingleFlight();

    const handleConfirm = () => {
        void singleFlight(async () => {
            try {
                await unbanCustomer.mutateAsync({
                    userId: customerId,
                    note: note.trim() || undefined,
                    displayName: customerName,
                });
            } catch {
                return;
            }
            setNote('');
            onOpenChange(false);
            onSuccess?.();
        });
    };

    const handleClose = () => {
        setNote('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md bg-card">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-success-subtle-foreground">
                        <UserCheck className="h-5 w-5" />
                        Unban Customer
                    </DialogTitle>
                    <DialogDescription>
                        You are about to unban <strong>{customerName}</strong>. This will restore their ability to make rentals.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-raised border border-border rounded-lg p-3 space-y-2">
                        <div>
                            <span className="text-xs text-muted-foreground block">Original Ban Reason</span>
                            <p className="text-sm text-foreground mt-1">
                                {accountStatus.banReason || 'No reason provided'}
                            </p>
                        </div>
                        {accountStatus.bannedAt && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Banned on: {formatDateTime(accountStatus.bannedAt)}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="unban-note" className="text-muted-foreground">
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
                        className="bg-success hover:bg-success"
                    >
                        <UserCheck className="h-4 w-4 mr-2" />
                        {unbanCustomer.isPending ? 'Unbanning...' : 'Unban Customer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}