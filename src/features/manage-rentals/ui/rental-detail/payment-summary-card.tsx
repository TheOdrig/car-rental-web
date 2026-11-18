'use client';

import { CreditCard, Download } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { showToast } from '@/shared/lib';
import { formatPrice } from './format';

interface PaymentSummaryCardProps {
    dailyPrice: number;
    days: number;
    totalPrice: number;
    totalSavings?: number;
    currency: string;
}

export function PaymentSummaryCard({ dailyPrice, days, totalPrice, totalSavings, currency }: PaymentSummaryCardProps) {
    const handleDownloadInvoice = () => {
        showToast.info('Invoice download coming soon');
    };

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

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950">
                    <p className="font-medium text-amber-800 dark:text-amber-200">Security Deposit</p>
                    <p className="text-amber-700 dark:text-amber-300">
                        {formatPrice(500, currency)} hold will be released after return
                    </p>
                </div>

                <Button
                    className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    variant="outline"
                    onClick={handleDownloadInvoice}
                >
                    <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                    Download Invoice
                </Button>
            </CardContent>
        </Card>
    );
}
