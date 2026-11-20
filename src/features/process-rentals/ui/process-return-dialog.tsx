'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { Car, AlertCircle } from 'lucide-react';
import type { PendingItem } from '@/entities/rental';
import { formatRentalReference } from '@/shared/lib';

interface ProcessReturnDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: PendingItem | null;
    onConfirm: (rentalId: number, data: ReturnData) => void;
    onReportDamage?: (rentalId: number) => void;
    isLoading?: boolean;
}

export interface ReturnData {
    hasDamage: boolean;
    notes?: string;
}

export function ProcessReturnDialog({
    open,
    onOpenChange,
    item,
    onConfirm,
    onReportDamage,
    isLoading = false,
}: ProcessReturnDialogProps) {
    const [hasDamage, setHasDamage] = useState(false);
    const [notes, setNotes] = useState('');

    if (!item) return null;

    const handleConfirm = () => {
        onConfirm(item.rentalId, {
            hasDamage,
            notes: notes.trim() || undefined
        });
        resetState();
        onOpenChange(false);
    };

    const resetState = () => {
        setHasDamage(false);
        setNotes('');
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) resetState();
            onOpenChange(val);
        }}>
            <DialogContent className="max-w-md bg-card border ">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Process Vehicle Return</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Confirm the vehicle return and note any issues.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    <div className="bg-muted rounded-xl p-4 border border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Car className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {item.carBrand} {item.carModel}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        {item.licensePlate}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-foreground">
                                    {item.customerName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatRentalReference(item.rentalId)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-3 rounded-lg border border-border bg-raised p-3">
                            <Checkbox
                                id="hasDamage"
                                checked={hasDamage}
                                onCheckedChange={(checked) => setHasDamage(checked as boolean)}
                                className="border-muted-foreground"
                            />
                            <Label
                                htmlFor="hasDamage"
                                className="text-sm font-medium cursor-pointer text-muted-foreground"
                            >
                                Vehicle has new damage to report
                            </Label>
                        </div>

                        {hasDamage && onReportDamage && (
                            <Button
                                variant="outline"
                                className="w-full border-danger-subtle-foreground/30 bg-danger-subtle text-danger-subtle-foreground hover:bg-danger-subtle gap-2 h-10 cursor-pointer"
                                onClick={() => onReportDamage(item.rentalId)}
                            >
                                <AlertCircle className="h-4 w-4" />
                                Create Damage Report
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="return-notes"
                            className="text-sm font-medium text-muted-foreground"
                        >
                            Return Notes <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Textarea
                            id="return-notes"
                            placeholder="Add any notes about the vehicle condition, fuel level, issues, etc."
                            className="h-24 bg-background dark:bg-input/30 border-border text-foreground placeholder:text-muted-foreground"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="cursor-pointer border-border text-muted-foreground hover:bg-muted"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 cursor-pointer"
                    >
                        {isLoading ? 'Processing...' : 'Complete Return'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}