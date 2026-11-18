'use client';

import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { formatPrice } from './format';

interface PaymentSummaryCardProps {
    dailyPrice: number;
    days: number;
    totalPrice: number;
    totalSavings?: number;
    currency: string;
}

export function PaymentSummaryCard({ dailyPrice, days, totalPrice, totalSavings, currency }: PaymentSummaryCardProps) {
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
                        <span className="font-medium text-slate-900 dark:text-white">{formatPrice(dailyPrice, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                            {days} {days === 1 ? 'day' : 'days'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                            {formatPrice(dailyPrice * days, currency)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Insurance</span>
                        <span className="font-medium text-green-600 dark:text-green-400">Included</span>
                    </div>
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
