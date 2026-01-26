'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useWaivePenalty } from '@/lib/hooks/use-late-returns';
import { formatCurrency } from '@/lib/utils/format';

const waiverSchema = z.object({
    fullWaiver: z.boolean(),
    waiverAmount: z.number().optional(),
    reason: z.string()
        .min(10, 'Reason must be at least 10 characters')
        .max(500, 'Reason cannot exceed 500 characters'),
}).refine(
    (data) => data.fullWaiver || (data.waiverAmount && data.waiverAmount > 0),
    { message: 'Either select full waiver or enter a waiver amount', path: ['waiverAmount'] }
);

type WaiverFormData = z.infer<typeof waiverSchema>;

interface PenaltyWaiveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rentalId: number;
    originalPenalty: number;
    currency: string;
}

export function PenaltyWaiveDialog({
    open,
    onOpenChange,
    rentalId,
    originalPenalty,
    currency,
}: PenaltyWaiveDialogProps) {
    const [isFullWaiver, setIsFullWaiver] = useState(false);
    const waivePenalty = useWaivePenalty();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<WaiverFormData>({
        resolver: zodResolver(waiverSchema),
        defaultValues: {
            fullWaiver: false,
            waiverAmount: undefined,
            reason: '',
        },
    });

    const waiverAmount = watch('waiverAmount');
    const remainingPenalty = isFullWaiver
        ? 0
        : originalPenalty - (waiverAmount || 0);

    useEffect(() => {
        setValue('fullWaiver', isFullWaiver);
        if (isFullWaiver) {
            setValue('waiverAmount', undefined);
        }
    }, [isFullWaiver, setValue]);

    useEffect(() => {
        if (!open) {
            reset();
            setIsFullWaiver(false);
        }
    }, [open, reset]);

    const onSubmit = (data: WaiverFormData) => {
        waivePenalty.mutate(
            {
                rentalId,
                request: {
                    fullWaiver: data.fullWaiver,
                    waiverAmount: data.fullWaiver ? undefined : data.waiverAmount,
                    reason: data.reason,
                },
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-slate-100">
                        Waive Penalty
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        Waive all or part of the late return penalty for this rental.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Original Penalty
                        </div>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(originalPenalty, currency)}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="fullWaiver"
                            checked={isFullWaiver}
                            onCheckedChange={(checked) => setIsFullWaiver(checked === true)}
                        />
                        <Label
                            htmlFor="fullWaiver"
                            className="text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                            Full Waiver (waive entire penalty)
                        </Label>
                    </div>

                    {!isFullWaiver && (
                        <div className="space-y-2">
                            <Label htmlFor="waiverAmount" className="text-slate-700 dark:text-slate-300">
                                Waiver Amount
                            </Label>
                            <Input
                                id="waiverAmount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={originalPenalty}
                                placeholder="Enter amount to waive"
                                {...register('waiverAmount', { valueAsNumber: true })}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            />
                            {errors.waiverAmount && (
                                <p className="text-sm text-red-500">{errors.waiverAmount.message}</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-slate-700 dark:text-slate-300">
                            Reason (required)
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Explain why this penalty is being waived (10-500 characters)"
                            {...register('reason')}
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[100px]"
                        />
                        {errors.reason && (
                            <p className="text-sm text-red-500">{errors.reason.message}</p>
                        )}
                    </div>

                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                            Remaining Penalty After Waiver
                        </div>
                        <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                            {formatCurrency(Math.max(0, remainingPenalty), currency)}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={waivePenalty.isPending}
                        >
                            {waivePenalty.isPending ? 'Waiving...' : 'Waive Penalty'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

