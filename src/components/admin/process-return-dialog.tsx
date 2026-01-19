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
import { Car, AlertCircle } from 'lucide-react';
import type { PendingItem } from '@/types/admin';

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
            <DialogContent className="max-w-md bg-white dark:bg-slate-900 border dark:border-slate-700">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">Process Vehicle Return</DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        Confirm the vehicle return and note any issues.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Car className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {item.carBrand} {item.carModel}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        {item.licensePlate}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {item.customerName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Rental #{item.rentalId}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
                            <Checkbox
                                id="hasDamage"
                                checked={hasDamage}
                                onCheckedChange={(checked) => setHasDamage(checked as boolean)}
                                className="border-slate-400 dark:border-slate-500"
                            />
                            <Label
                                htmlFor="hasDamage"
                                className="text-sm font-medium cursor-pointer text-slate-700 dark:text-slate-300"
                            >
                                Vehicle has new damage to report
                            </Label>
                        </div>

                        {hasDamage && onReportDamage && (
                            <Button
                                variant="outline"
                                className="w-full border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 gap-2 h-10 cursor-pointer"
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
                            className="text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Return Notes <span className="text-slate-500 dark:text-slate-500">(optional)</span>
                        </Label>
                        <Textarea
                            id="return-notes"
                            placeholder="Add any notes about the vehicle condition, fuel level, issues, etc."
                            className="h-24 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
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
                        className="cursor-pointer border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
