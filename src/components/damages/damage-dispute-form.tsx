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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDisputeDamage } from '@/lib/hooks';

const disputeSchema = z.object({
    reason: z.string().min(1, 'Reason is required').max(500, 'Reason cannot exceed 500 characters'),
    comments: z.string().max(1000, 'Comments cannot exceed 1000 characters').optional(),
});

type DisputeFormData = z.infer<typeof disputeSchema>;

interface DamageDisputeFormProps {
    damageId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function DamageDisputeForm({
    damageId,
    open,
    onOpenChange,
    onSuccess,
}: DamageDisputeFormProps) {
    const disputeDamage = useDisputeDamage();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<DisputeFormData>({
        resolver: zodResolver(disputeSchema),
    });

    const onSubmit = async (data: DisputeFormData) => {
        try {
            await disputeDamage.mutateAsync({
                damageId,
                request: {
                    reason: data.reason,
                    comments: data.comments,
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
                    <DialogTitle>Dispute Damage Charge</DialogTitle>
                    <DialogDescription>
                        If you believe this damage charge is incorrect, please provide your reason for disputing it.
                        Our team will review your dispute and respond within 3-5 business days.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Dispute *</Label>
                        <Textarea
                            id="reason"
                            placeholder="Explain why you are disputing this charge..."
                            className="min-h-[100px]"
                            {...register('reason')}
                        />
                        {errors.reason && (
                            <p className="text-sm text-destructive">{errors.reason.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comments">Additional Comments (Optional)</Label>
                        <Textarea
                            id="comments"
                            placeholder="Any additional information that might help..."
                            {...register('comments')}
                        />
                        {errors.comments && (
                            <p className="text-sm text-destructive">{errors.comments.message}</p>
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
                        <Button type="submit" disabled={disputeDamage.isPending}>
                            {disputeDamage.isPending ? 'Submitting...' : 'Submit Dispute'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

