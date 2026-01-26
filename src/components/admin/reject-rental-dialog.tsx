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
import { cn } from '@/lib/utils';
import { safeFormatDate } from '@/lib/utils/format';
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
            <DialogContent className="max-w-md bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-600" />

                <DialogHeader className="pt-2">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 dark:bg-rose-500/20 mb-4 shadow-sm border border-rose-500/20">
                        <AlertTriangle className="h-7 w-7 text-rose-600 dark:text-rose-500" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        Reject Rental Request
                    </DialogTitle>
                    <DialogDescription className="text-center text-slate-500 dark:text-slate-400 px-4">
                        This action will inform the customer that their request has been declined. This cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-5 space-y-4 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Car className="h-10 w-10 text-slate-900 dark:text-white" />
                        </div>

                        <div className="flex items-center justify-between gap-4 relative z-10">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm text-slate-400 dark:text-slate-500">
                                    <Car className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                    {item.carBrand} {item.carModel}
                                </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold tracking-tighter text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 px-2 py-0.5 rounded border border-transparent dark:border-slate-700/50">
                                {item.licensePlate}
                            </span>
                        </div>

                        <div className="flex items-center gap-2.5 relative z-10">
                            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm text-slate-400 dark:text-slate-500">
                                <User className="h-4 w-4" />
                            </div>
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.customerName}</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-500 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 relative z-10">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="font-medium tracking-tight">
                                {safeFormatDate(item.startDate, 'MMM d')} - {safeFormatDate(item.endDate, 'MMM d, yyyy')}
                            </span>
                        </div>
                    </div>

                    {}
                    <div className="space-y-3">
                        <Label htmlFor="reject-reason" className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            Rejection Reason <span className="text-rose-500">*</span>
                        </Label>
                        <Textarea
                            id="reject-reason"
                            placeholder="Please explain the reason for rejection (this will be sent to the customer)..."
                            className={cn(
                                "h-32 resize-none bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-rose-500 focus-visible:border-rose-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all rounded-xl",
                                error && "border-rose-500/50 ring-1 ring-rose-500/20 focus-visible:ring-rose-500"
                            )}
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (e.target.value.trim()) setError(null);
                            }}
                        />
                        {error && (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 animate-in fade-in slide-in-from-top-1">
                                <AlertTriangle className="h-3 w-3" />
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-3 sm:gap-3 p-2 bg-slate-50/50 dark:bg-slate-900/50 -mx-6 -mb-6 mt-2 border-t border-slate-100 dark:border-slate-800/50">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white font-bold h-11 px-6 shadow-lg shadow-rose-500/20 gap-2"
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

