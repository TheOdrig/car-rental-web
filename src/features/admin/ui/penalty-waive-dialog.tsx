'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { useWaivePenalty } from '@/features/admin';
import { formatCurrency } from '@/shared/lib';
import { fieldErrorMap } from '@/shared/api';

export function createWaiverSchema(originalPenalty: number, currency: string) {
    return z
        .object({
            fullWaiver: z.boolean(),
            waiverAmount: z.number().optional(),
            reason: z
                .string()
                .min(10, 'Reason must be at least 10 characters')
                .max(500, 'Reason cannot exceed 500 characters'),
        })
        .superRefine((data, ctx) => {
            if (data.fullWaiver) return;
            const amount = data.waiverAmount;
            if (!amount || Number.isNaN(amount) || amount <= 0) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['waiverAmount'],
                    message: 'Either select full waiver or enter a waiver amount',
                });
            } else if (amount > originalPenalty) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['waiverAmount'],
                    message: `The waiver cannot be more than the penalty of ${formatCurrency(originalPenalty, currency)}`,
                });
            }
        });
}

type WaiverFormData = z.infer<ReturnType<typeof createWaiverSchema>>;

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
    const apiErrors = fieldErrorMap(waivePenalty.error);
    const schema = useMemo(() => createWaiverSchema(originalPenalty, currency), [originalPenalty, currency]);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors },
    } = useForm<WaiverFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            fullWaiver: false,
            waiverAmount: undefined,
            reason: '',
        },
    });

    const waiverAmount = useWatch({ control, name: 'waiverAmount' });
    const exceedsPenalty = !isFullWaiver && (waiverAmount || 0) > originalPenalty;
    const waiverAmountError = !isFullWaiver && (Boolean(apiErrors.waiverAmount) || exceedsPenalty || Boolean(errors.waiverAmount));
    const remainingPenalty = isFullWaiver
        ? 0
        : originalPenalty - (waiverAmount || 0);

    useEffect(() => {
        setValue('fullWaiver', isFullWaiver);
        if (isFullWaiver) {
            setValue('waiverAmount', undefined);
        }
    }, [isFullWaiver, setValue]);

    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen);
        if (!newOpen) {
            waivePenalty.reset();
            reset();
            setIsFullWaiver(false);
        }
    };

    const onSubmit = (data: WaiverFormData) => {
        if (waivePenalty.isPending) return;
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
                    handleOpenChange(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
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
                                placeholder="Enter amount to waive"
                                {...register('waiverAmount', { valueAsNumber: true })}
                                aria-invalid={waiverAmountError ? true : undefined}
                                aria-describedby={waiverAmountError ? 'waiverAmount-error' : undefined}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            />
                            {apiErrors.waiverAmount && !exceedsPenalty ? (
                                <p id="waiverAmount-error" className="text-sm text-red-600 dark:text-red-400" role="alert" data-testid="waiver-amount-api-error">
                                    {apiErrors.waiverAmount}
                                </p>
                            ) : exceedsPenalty ? (
                                <p id="waiverAmount-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                                    The waiver cannot be more than the penalty of {formatCurrency(originalPenalty, currency)}
                                </p>
                            ) : (
                                errors.waiverAmount && (
                                    <p id="waiverAmount-error" className="text-sm text-red-600 dark:text-red-400">{errors.waiverAmount.message}</p>
                                )
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
                        {(errors.reason?.message ?? apiErrors.reason) && (
                            <p className="text-sm text-red-500">{errors.reason?.message ?? apiErrors.reason}</p>
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
                            disabled={waivePenalty.isPending || exceedsPenalty}
                        >
                            {waivePenalty.isPending ? 'Waiving...' : 'Waive Penalty'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
