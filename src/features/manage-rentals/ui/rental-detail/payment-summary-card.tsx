'use client';

import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { formatPrice } from './format';

interface PaymentSummaryCardProps {
    dailyPrice: number;
    days: number;
    originalPrice?: number;
    totalPrice: number;
    totalSavings?: number;
    currency: string;
}

export function dailyRateIsRounded(dailyPrice: number, days: number, originalPrice: number | undefined, totalPrice: number, totalSavings = 0): boolean {
    const reference = originalPrice ?? totalPrice + totalSavings;
    return Math.abs(dailyPrice * days - reference) >= 0.005;
}

export function PaymentSummaryCard({ dailyPrice, days, originalPrice, totalPrice, totalSavings, currency }: PaymentSummaryCardProps) {
    const rounded = dailyRateIsRounded(dailyPrice, days, originalPrice, totalPrice, totalSavings);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5" aria-hidden="true" />
                    Payment Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Daily rate</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                            {rounded ? '≈ ' : ''}
                            {formatPrice(dailyPrice, currency)}
                        </span>
                    </div>
                    {rounded && (
                        <p className="text-xs text-muted-foreground" data-testid="rounded-daily-rate-note">
                            The daily rate is rounded for display. The subtotal and total use the exact rate, so{' '}
                            {days} × {formatPrice(dailyPrice, currency)} can differ from the total by a cent or two.
                        </p>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                            {days} {days === 1 ? 'day' : 'days'}
                        </span>
                    </div>
                    {originalPrice !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                                {formatPrice(originalPrice, currency)}
                            </span>
                        </div>
                    )}
                    {totalSavings !== undefined && totalSavings > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Savings</span>
                            <span>-{formatPrice(totalSavings, currency)}</span>
                        </div>
                    )}
                    <div className="flex justify-between border-t pt-3 text-lg font-bold">
                        <span>Total</span>
                        <span className="text-slate-900 dark:text-white">{formatPrice(totalPrice, currency)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
