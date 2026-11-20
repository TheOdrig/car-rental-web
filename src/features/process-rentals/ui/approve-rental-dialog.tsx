'use client';

import { useState } from 'react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
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
import {
    Calendar,
    User,
    Car,
    CheckCircle2
} from 'lucide-react';
import { formatDate, formatAmount } from '@/shared/lib';
import { DynamicImage } from '@/shared/ui/dynamic-image';
import type { PendingItem } from '@/entities/rental';

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
            <DialogContent className="sm:max-w-2xl bg-card border-border shadow-2xl overflow-hidden">

                <DialogHeader className="pt-2">
                    <DialogTitle className="text-2xl font-bold">
                        Approve Rental Request
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Review the rental details carefully before approving this request.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid min-w-0 gap-6 py-4">
                    <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2">
                        <div className="group relative p-4 rounded-xl border border-border bg-raised transition-all hover:bg-accent overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Car className="h-12 w-12" />
                            </div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                <Car className="h-3.5 w-3.5" />
                                Vehicle
                            </h3>
                            <div className="flex gap-4 relative z-10">
                                {item.carImage ? (
                                    <div className="relative h-20 w-32 shrink-0 shadow-sm border border-border rounded-lg overflow-hidden">
                                        <DynamicImage
                                            src={item.carImage}
                                            alt={`${item.carBrand} ${item.carModel}`}
                                            fill
                                            className="object-cover"
                                            sizes="128px"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-20 w-32 shrink-0 rounded-lg border border-border bg-muted flex items-center justify-center">
                                        <Car className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="space-y-1.5 min-w-0">
                                    <p className="font-bold text-base text-foreground [overflow-wrap:anywhere]">
                                        {item.carBrand} {item.carModel}
                                    </p>
                                    <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded w-fit">
                                        {item.licensePlate}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="group relative p-4 rounded-xl border border-border bg-raised transition-all hover:bg-accent overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                <User className="h-12 w-12" />
                            </div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                <User className="h-3.5 w-3.5" />
                                Customer
                            </h3>
                            <div className="flex gap-4 relative z-10">
                                <div className="h-14 w-14 shrink-0 rounded-full border border-border bg-muted flex items-center justify-center">
                                    <User className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-bold text-base text-foreground [overflow-wrap:anywhere]">{item.customerName}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground [overflow-wrap:anywhere]">
                                        {item.customerEmail}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-muted rounded-lg p-6 shadow-inner">

                        <div className="relative z-10 grid grid-cols-3 gap-x-4 gap-y-5">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3" />
                                    Pick-up
                                </p>
                                <div className="text-sm font-semibold text-foreground">
                                    {formatDate(item.startDate)}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3" />
                                    Return
                                </p>
                                <div className="text-sm font-semibold text-foreground">
                                    {formatDate(item.endDate)}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Duration</p>
                                <div className="text-sm font-semibold text-foreground">
                                    <span className="text-primary">{differenceInCalendarDays(parseISO(item.endDate), parseISO(item.startDate)) + 1}</span> Days
                                </div>
                            </div>
                            <div className="col-span-3 space-y-1 border-t border-border pt-4 ">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Amount</p>
                                <div className="flex min-w-[8ch] items-baseline gap-1 text-3xl font-black text-foreground">
                                    {formatAmount(item.totalAmount, item.currency)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label htmlFor="notes" className="text-sm font-bold text-muted-foreground">
                                Internal Notes <span className="text-muted-foreground font-normal text-xs ml-1">(Optional)</span>
                            </label>
                        </div>
                        <Textarea
                            id="notes"
                            placeholder="Add administrative notes regarding this approval..."
                            className="bg-raised border-border focus-visible:ring-ring focus-visible:border-ring h-28 resize-none placeholder:text-muted-foreground transition-all rounded-xl"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-3 sm:gap-3 p-2 bg-raised -mx-6 -mb-6 mt-2 border-t border-border">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="font-semibold text-muted-foreground hover:bg-accent"
                    >
                        Keep Pending
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11 px-6"
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