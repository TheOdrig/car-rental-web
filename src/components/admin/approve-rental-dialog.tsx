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
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    User,
    Car,
    CheckCircle2
} from 'lucide-react';
import { safeFormatDate } from '@/lib/utils/format';
import Image from 'next/image';
import type { PendingItem } from '@/types/admin';

interface ApproveRentalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: PendingItem | null;
    onApprove: (rentalId: number, notes?: string) => void;
    isLoading?: boolean;
}

export function ApproveRentalDialog({
    open,
    onOpenChange,
    item,
    onApprove,
    isLoading = false,
}: ApproveRentalDialogProps) {
    const [notes, setNotes] = useState('');

    if (!item) return null;

    const handleConfirm = () => {
        onApprove(item.rentalId, notes);
        setNotes('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

                <DialogHeader className="pt-2">
                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        Approve Rental Request
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                        Review the rental details carefully before approving this request.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {}
                        <div className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 transition-all hover:bg-slate-100 dark:hover:bg-slate-900 overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Car className="h-12 w-12" />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                                <Car className="h-3.5 w-3.5" />
                                Vehicle
                            </h4>
                            <div className="flex gap-4 relative z-10">
                                {item.carImage ? (
                                    <div className="relative h-20 w-32 shrink-0 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                        <Image
                                            src={item.carImage}
                                            alt={`${item.carBrand} ${item.carModel}`}
                                            fill
                                            className="object-cover"
                                            sizes="128px"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-20 w-32 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Car className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                                    </div>
                                )}
                                <div className="space-y-1.5 min-w-0">
                                    <p className="font-bold text-base text-slate-900 dark:text-white truncate">
                                        {item.carBrand} {item.carModel}
                                    </p>
                                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 px-2 py-0.5 rounded w-fit">
                                        {item.licensePlate}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {item.fuelType && (
                                            <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-normal">
                                                {item.fuelType}
                                            </Badge>
                                        )}
                                        {item.transmission && (
                                            <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-normal">
                                                {item.transmission}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 transition-all hover:bg-slate-100 dark:hover:bg-slate-900 overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                <User className="h-12 w-12" />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                                <User className="h-3.5 w-3.5" />
                                Customer
                            </h4>
                            <div className="flex gap-4 relative z-10">
                                {item.customerImage ? (
                                    <div className="relative h-14 w-14 shrink-0 shadow-sm border border-white dark:border-slate-700 rounded-full overflow-hidden">
                                        <Image
                                            src={item.customerImage}
                                            alt={item.customerName}
                                            fill
                                            className="object-cover"
                                            sizes="56px"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-14 w-14 shrink-0 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <User className="h-6 w-6 text-slate-400 dark:text-slate-600" />
                                    </div>
                                )}
                                <div className="space-y-1.5 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-bold text-base text-slate-900 dark:text-white truncate">{item.customerName}</p>
                                        {item.isCustomerVerified && (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {item.customerEmail}
                                    </p>
                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[10px] h-5 font-bold">
                                        VERIFIED IDENTITY
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-900 rounded-2xl p-6 shadow-inner">
                        <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl bg-blue-500 rounded-full -mr-4 -mt-4 w-32 h-32" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center relative z-10">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3" />
                                    Pick-up
                                </p>
                                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {safeFormatDate(item.startDate, 'MMM dd, yyyy')}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3" />
                                    Return
                                </p>
                                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {safeFormatDate(item.endDate, 'MMM dd, yyyy')}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Duration</p>
                                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                    <span className="text-primary">{item.duration || 0}</span> Days
                                </div>
                            </div>
                            <div className="space-y-1 ml-auto text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Amount</p>
                                <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                                    <span className="text-xl text-primary font-bold">$</span>
                                    {item.totalAmount.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label htmlFor="notes" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Internal Notes <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span>
                            </label>
                        </div>
                        <Textarea
                            id="notes"
                            placeholder="Add administrative notes regarding this approval..."
                            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-28 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all rounded-xl"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-3 sm:gap-3 p-2 bg-slate-50/50 dark:bg-slate-900/50 -mx-6 -mb-6 mt-2 border-t border-slate-100 dark:border-slate-800/50">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                        Keep Pending
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold h-11 px-6 shadow-lg shadow-blue-500/20"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                Confirm Approval
                            </div>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
