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
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    User,
    Car,
    CheckCircle2,
    Fuel,
    Settings2
} from 'lucide-react';
import { format } from 'date-fns';
import type { PendingItem } from '@/types/admin';

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
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Approve Rental Request</DialogTitle>
                    <DialogDescription>
                        Review the rental details carefully before approving.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Vehicle & Customer Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Vehicle Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Car className="h-4 w-4 text-primary" />
                                Vehicle Information
                            </h4>
                            <div className="flex gap-4">
                                {item.carImage ? (
                                    <img
                                        src={item.carImage}
                                        alt={`${item.carBrand} ${item.carModel}`}
                                        className="h-20 w-32 object-cover rounded-lg border bg-muted"
                                    />
                                ) : (
                                    <div className="h-20 w-32 rounded-lg border bg-muted flex items-center justify-center">
                                        <Car className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <p className="font-medium text-sm">
                                        {item.carBrand} {item.carModel}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Plate: {item.licensePlate}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {item.fuelType && (
                                            <Badge variant="outline" className="text-[10px] h-5 gap-1 font-normal">
                                                <Fuel className="h-3 w-3" />
                                                {item.fuelType}
                                            </Badge>
                                        )}
                                        {item.transmission && (
                                            <Badge variant="outline" className="text-[10px] h-5 gap-1 font-normal">
                                                <Settings2 className="h-3 w-3" />
                                                {item.transmission}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                Customer Information
                            </h4>
                            <div className="flex gap-4">
                                {item.customerImage ? (
                                    <img
                                        src={item.customerImage}
                                        alt={item.customerName}
                                        className="h-12 w-12 rounded-full object-cover border"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full border bg-muted flex items-center justify-center">
                                        <User className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-medium text-sm">{item.customerName}</p>
                                        {item.isCustomerVerified && (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {item.customerEmail}
                                    </p>
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[10px] h-5">
                                        ID Verified
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rental Details Grid */}
                    <div className="bg-muted/30 rounded-xl p-4 border border-dashed">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Start Date</p>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                    {format(new Date(item.startDate), 'MMM d, yyyy')}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">End Date</p>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                    {format(new Date(item.endDate), 'MMM d, yyyy')}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration</p>
                                <div className="text-sm font-medium">
                                    {item.duration || 0} Days
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Total Payout</p>
                                <div className="text-lg font-bold text-primary">
                                    ${item.totalAmount.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Internal Notes */}
                    <div className="space-y-2">
                        <label htmlFor="notes" className="text-sm font-semibold">
                            Internal Notes (Optional)
                        </label>
                        <Textarea
                            id="notes"
                            placeholder="Add any internal notes for this approval..."
                            className="bg-muted/20 border-muted-foreground/20 focus-visible:ring-primary h-24"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
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
                        {isLoading ? 'Processing...' : 'Approve Request'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
