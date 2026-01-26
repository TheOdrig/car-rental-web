'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useResolveDamage } from '@/lib/hooks';

const resolveSchema = z.object({
    adjustedRepairCost: z.coerce.number().min(0, 'Adjusted repair cost cannot be negative'),
    adjustedCustomerLiability: z.coerce.number().min(0, 'Adjusted liability cannot be negative'),
    resolutionNotes: z.string().min(1, 'Resolution notes are required').max(1000, 'Notes cannot exceed 1000 characters'),
});

type ResolveFormData = z.infer<typeof resolveSchema>;

interface DamageResolveDialogProps {
    damageId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    defaultValues?: {
        repairCostEstimate?: number;
        customerLiability?: number;
    };
}

export function DamageResolveDialog({
    damageId,
    open,
    onOpenChange,
    onSuccess,
    defaultValues,
}: DamageResolveDialogProps) {
    const resolveDamage = useResolveDamage();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(resolveSchema),
        defaultValues: {
            adjustedRepairCost: defaultValues?.repairCostEstimate || 0,
            adjustedCustomerLiability: defaultValues?.customerLiability || 0,
            resolutionNotes: '',
        },
    });

    const onSubmit = async (data: ResolveFormData) => {
        try {
            await resolveDamage.mutateAsync({
                damageId,
                resolution: {
                    adjustedRepairCost: data.adjustedRepairCost,
                    adjustedCustomerLiability: data.adjustedCustomerLiability,
                    resolutionNotes: data.resolutionNotes,
                },
            });
            reset();
            onOpenChange(false);
            onSuccess?.();
        } catch {
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Resolve Dispute</DialogTitle>
                    <DialogDescription>
                        Review the customer dispute and provide your resolution. You can adjust the repair cost and customer liability.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="adjustedRepairCost">Adjusted Repair Cost ($) *</Label>
                            <Input
                                id="adjustedRepairCost"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...register('adjustedRepairCost')}
                            />
                            {errors.adjustedRepairCost && (
                                <p className="text-sm text-destructive">{errors.adjustedRepairCost.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adjustedCustomerLiability">Customer Liability ($) *</Label>
                            <Input
                                id="adjustedCustomerLiability"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...register('adjustedCustomerLiability')}
                            />
                            {errors.adjustedCustomerLiability && (
                                <p className="text-sm text-destructive">{errors.adjustedCustomerLiability.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="resolutionNotes">Resolution Notes *</Label>
                        <Textarea
                            id="resolutionNotes"
                            placeholder="Explain the resolution decision..."
                            className="min-h-[100px]"
                            {...register('resolutionNotes')}
                        />
                        {errors.resolutionNotes && (
                            <p className="text-sm text-destructive">{errors.resolutionNotes.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={resolveDamage.isPending}>
                            {resolveDamage.isPending ? 'Resolving...' : 'Resolve Dispute'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

