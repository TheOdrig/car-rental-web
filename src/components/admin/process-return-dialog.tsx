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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
    Car,
    ClipboardCheck,
    AlertCircle,
    Gauge,
    Fuel,
    Sparkles
} from 'lucide-react';
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
    odometerReading: number;
    fuelLevel: string;
    noNewDamages: boolean;
    interiorCleaned: boolean;
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
    const [odometer, setOdometer] = useState<string>('');
    const [fuelLevel, setFuelLevel] = useState<string>('full');
    const [noNewDamages, setNoNewDamages] = useState(true);
    const [interiorCleaned, setInteriorCleaned] = useState(true);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!item) return null;

    const handleConfirm = () => {
        if (!odometer) {
            setError('Please provide the odometer reading.');
            return;
        }
        setError(null);
        onConfirm(item.rentalId, {
            odometerReading: parseInt(odometer),
            fuelLevel,
            noNewDamages,
            interiorCleaned,
            notes
        });
        resetState();
        onOpenChange(false);
    };

    const resetState = () => {
        setOdometer('');
        setFuelLevel('full');
        setNoNewDamages(true);
        setInteriorCleaned(true);
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
                    <DialogTitle>Process Vehicle Return</DialogTitle>
                    <DialogDescription>
                        Record final vehicle details and status upon return.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Summary Block */}
                    <div className="bg-muted/40 rounded-xl p-3 border border-dashed flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Car className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-xs font-semibold">{item.carBrand} {item.carModel}</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase">{item.licensePlate}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-semibold">{item.customerName}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase">Customer</p>
                        </div>
                    </div>

                    {/* Return Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="odometer" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Odometer Reading
                            </Label>
                            <div className="relative">
                                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="odometer"
                                    type="number"
                                    placeholder="Enter km"
                                    className="pl-9 h-10"
                                    value={odometer}
                                    onChange={(e) => setOdometer(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fuel" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Fuel Level
                            </Label>
                            <Select value={fuelLevel} onValueChange={setFuelLevel}>
                                <SelectTrigger id="fuel" className="h-10">
                                    <div className="flex items-center gap-2">
                                        <Fuel className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Fuel" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full">Full Tank</SelectItem>
                                    <SelectItem value="3/4">3/4 Tank</SelectItem>
                                    <SelectItem value="1/2">1/2 Tank</SelectItem>
                                    <SelectItem value="1/4">1/4 Tank</SelectItem>
                                    <SelectItem value="empty">Empty</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Checklist Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <ClipboardCheck className="h-4 w-4 text-primary" />
                            Return Checklist
                        </h4>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 space-y-0 rounded-lg border p-3">
                                <Checkbox
                                    id="damages"
                                    checked={noNewDamages}
                                    onCheckedChange={(checked) => setNoNewDamages(checked as boolean)}
                                />
                                <div className="space-y-1 leading-none">
                                    <Label htmlFor="damages" className="text-sm font-semibold cursor-pointer">
                                        No new damages found
                                    </Label>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 space-y-0 rounded-lg border p-3">
                                <Checkbox
                                    id="clean"
                                    checked={interiorCleaned}
                                    onCheckedChange={(checked) => setInteriorCleaned(checked as boolean)}
                                />
                                <div className="space-y-1 leading-none flex items-center gap-2">
                                    <Label htmlFor="clean" className="text-sm font-semibold cursor-pointer">
                                        Interior cleaned
                                    </Label>
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {!noNewDamages && onReportDamage && (
                        <Button
                            variant="outline"
                            className="w-full border-destructive text-destructive hover:bg-destructive/10 gap-2 h-10"
                            onClick={() => onReportDamage(item.rentalId)}
                        >
                            <AlertCircle className="h-4 w-4" />
                            Create Damage Report
                        </Button>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="return-notes" className="text-sm font-semibold text-muted-foreground">
                            Internal Return Notes
                        </Label>
                        <Textarea
                            id="return-notes"
                            placeholder="Add notes about vehicle wear, fuel etc."
                            className="h-20"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="text-xs font-medium text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20">
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
                        {isLoading ? 'Processing...' : 'Complete Return'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
