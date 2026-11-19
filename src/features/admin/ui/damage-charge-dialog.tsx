'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { formatCurrencyWithDecimals } from '@/shared/lib';
import { useChargeDamage } from '@/entities/damage';

interface DamageChargeDialogProps {
    damageId: number;
    amount: number;
    currency: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function DamageChargeDialog({
    damageId,
    amount,
    currency,
    open,
    onOpenChange,
    onSuccess,
}: DamageChargeDialogProps) {
    const chargeDamage = useChargeDamage();

    const handleCharge = async (event: React.MouseEvent) => {
        event.preventDefault();
        try {
            await chargeDamage.mutateAsync(damageId);
            onOpenChange(false);
            onSuccess?.();
        } catch {
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Charge customer</AlertDialogTitle>
                    <AlertDialogDescription>
                        The card saved with the rental will be charged {formatCurrencyWithDecimals(amount, currency)} ({currency}) for this damage report. A charged report can then be disputed by the customer.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={chargeDamage.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCharge} disabled={chargeDamage.isPending}>
                        {chargeDamage.isPending ? 'Charging...' : `Charge ${formatCurrencyWithDecimals(amount, currency)}`}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
