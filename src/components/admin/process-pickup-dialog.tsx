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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    User,
    Car,
    ClipboardCheck,
    Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PendingItem } from '@/types/admin';

interface ProcessPickupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: PendingItem | null;
    onConfirm: (rentalId: number, notes?: string) => void;
    isLoading?: boolean;
}

export function ProcessPickupDialog({
    open,
    onOpenChange,
    item,
    onConfirm,
    isLoading = false,
}: ProcessPickupDialogProps) {
    const [idVerified, setIdVerified] = useState(false);
    const [conditionInspected, setConditionInspected] = useState(false);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!item) return null;

    const handleConfirm = () => {
        if (!idVerified || !conditionInspected) {
            setError('Please complete all checklist items before proceeding.');
            return;
        }
        setError(null);
        onConfirm(item.rentalId, notes);
        resetState();
        onOpenChange(false);
    };

    const resetState = () => {
        setIdVerified(false);
        setConditionInspected(false);
        setNotes('');
        setError(null);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) resetState();
            onOpenChange(val);
        }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Vehicle Pickup</DialogTitle>
                    <DialogDescription>
                        Complete the handover checklist before documenting the pickup.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="bg-muted/40 rounded-xl p-4 border space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border shadow-sm">
                                <User className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Customer</p>
                                <p className="text-sm font-semibold truncate">{item.customerName}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border shadow-sm">
                                    <Car className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Vehicle</p>
                                    <p className="text-sm font-semibold truncate">{item.carBrand} {item.carModel}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Plate</p>
                                <p className="text-sm font-semibold">{item.licensePlate}</p>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-dashed flex items-center gap-2 text-muted-foreground">
                            <Hash className="h-3 w-3" />
                            <span className="text-[11px] font-medium">Reservation ID: RENT-{item.rentalId}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <ClipboardCheck className="h-4 w-4 text-primary" />
                            Handover Checklist
                        </h4>

                        <div className="space-y-3">
                            <div className={cn(
                                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                                idVerified ? "bg-green-50 border-green-200" : "bg-background"
                            )}>
                                <Checkbox
                                    id="id-verify"
                                    className="mt-1"
                                    checked={idVerified}
                                    onCheckedChange={(checked) => setIdVerified(checked as boolean)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="id-verify" className="text-sm font-semibold cursor-pointer">
                                        Customer ID Verified
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Verify physical driver&apos;s license matches customer profile.
                                    </p>
                                </div>
                            </div>

                            <div className={cn(
                                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                                conditionInspected ? "bg-green-50 border-green-200" : "bg-background"
                            )}>
                                <Checkbox
                                    id="inspection"
                                    className="mt-1"
                                    checked={conditionInspected}
                                    onCheckedChange={(checked) => setConditionInspected(checked as boolean)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="inspection" className="text-sm font-semibold cursor-pointer">
                                        Vehicle condition inspected
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Ensure all existing damages are documented and car is clean.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pickup-notes" className="text-sm font-semibold">
                            Pickup Notes
                        </Label>
                        <Textarea
                            id="pickup-notes"
                            placeholder="Add any observations during handover..."
                            className="h-20"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="text-xs font-medium text-destructive bg-destructive/10 p-2 rounded-md">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {isLoading ? 'Processing...' : 'Confirm Pickup'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
