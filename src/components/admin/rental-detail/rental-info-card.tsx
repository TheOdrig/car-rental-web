'use client';

import { FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/admin';
import { safeFormatDate, formatCurrency } from '@/lib/utils/format';
import type { AdminRentalStatus, RentalPricing } from '@/types';

interface RentalInfoCardProps {
    rentalId: number;
    status: AdminRentalStatus;
    createdAt: string;
    startDate: string;
    endDate: string;
    duration: number;
    pricing?: RentalPricing;
    pickupLocation?: string;
    dropoffLocation?: string;
    notes?: string;
}

const statusVariants: Record<AdminRentalStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PENDING: 'secondary',
    CONFIRMED: 'default',
    ACTIVE: 'default',
    COMPLETED: 'outline',
    CANCELLED: 'destructive',
    REJECTED: 'destructive',
};

const statusLabels: Record<AdminRentalStatus, string> = {
    PENDING: 'Pending Approval',
    CONFIRMED: 'Confirmed',
    ACTIVE: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected',
};

export function RentalInfoCard({
    rentalId,
    status,
    createdAt,
    startDate,
    endDate,
    duration,
    pricing,
    pickupLocation,
    dropoffLocation,
    notes,
}: RentalInfoCardProps) {
    const referenceNumber = `CR-${String(rentalId).padStart(6, '0')}`;

    return (
        <Card className="border-white/50 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Rental Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Reference</span>
                    <div className="flex items-center gap-1">
                        <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                            {referenceNumber}
                        </span>
                        <CopyButton value={referenceNumber} />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                    <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Duration</span>
                    <div className="flex items-center gap-1 text-slate-900 dark:text-slate-100">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{duration} days</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Created</span>
                    <span className="text-sm text-slate-900 dark:text-slate-100">
                        {safeFormatDate(createdAt, 'datetime')}
                    </span>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Start Date</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {safeFormatDate(startDate)}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">End Date</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {safeFormatDate(endDate)}
                            </span>
                        </div>
                    </div>
                </div>

                {pricing && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Daily Rate</span>
                            <span className="text-sm text-slate-900 dark:text-slate-100">
                                {formatCurrency(pricing.dailyRate, pricing.currency)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Subtotal</span>
                            <span className="text-sm text-slate-900 dark:text-slate-100">
                                {formatCurrency(pricing.subtotal, pricing.currency)}
                            </span>
                        </div>
                        {pricing.discounts > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-emerald-600 dark:text-emerald-400">Discount</span>
                                <span className="text-sm text-emerald-600 dark:text-emerald-400">
                                    -{formatCurrency(pricing.discounts, pricing.currency)}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Total</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                {formatCurrency(pricing.finalTotal, pricing.currency)}
                            </span>
                        </div>
                        {pricing.exchangeRate && pricing.exchangeRate !== 1 && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
                                Exchange rate: {pricing.exchangeRate.toFixed(4)}
                            </div>
                        )}
                    </div>
                )}

                {(pickupLocation || dropoffLocation) && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            {pickupLocation && (
                                <div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Pickup</span>
                                    <span className="text-sm text-slate-900 dark:text-slate-100">{pickupLocation}</span>
                                </div>
                            )}
                            {dropoffLocation && (
                                <div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Drop-off</span>
                                    <span className="text-sm text-slate-900 dark:text-slate-100">{dropoffLocation}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {notes && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Notes</span>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{notes}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

