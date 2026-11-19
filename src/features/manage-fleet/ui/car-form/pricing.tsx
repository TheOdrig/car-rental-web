'use client';

import React from 'react';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { cn, formatCurrencyWithDecimals, getCurrencySymbol } from '@/shared/lib';
import { DEFAULT_CURRENCY } from '@/shared/config/constants';
import type { CarFormData } from '../../model/types';

interface PricingSectionProps {
    data: CarFormData;
    errors: Partial<Record<keyof CarFormData, string>>;
    onUpdate: (field: keyof CarFormData, value: string | number) => void;
    currency?: string;
}

export function PricingSection({ data, errors, onUpdate, currency = DEFAULT_CURRENCY }: PricingSectionProps) {
    const symbol = getCurrencySymbol(currency);
    const handleNumberChange = (field: keyof CarFormData, value: string) => {
        const numValue = parseFloat(value) || 0;
        onUpdate(field, numValue);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="dailyRate">
                    Daily Rate <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden="true">{symbol}</span>
                    <Input
                        id="dailyRate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.dailyRate || ''}
                        onChange={(e) => handleNumberChange('dailyRate', e.target.value)}
                        placeholder="0.00"
                        className={cn(
                            'pl-10',
                            errors.dailyRate && 'border-destructive'
                        )}
                    />
                </div>
                {errors.dailyRate && (
                    <p className="text-sm text-destructive">{errors.dailyRate}</p>
                )}
                <p className="text-xs text-muted-foreground">
                    Standard daily rental rate
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="weeklyRate">Weekly Rate</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden="true">{symbol}</span>
                    <Input
                        id="weeklyRate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.weeklyRate || ''}
                        onChange={(e) => handleNumberChange('weeklyRate', e.target.value)}
                        placeholder="0.00"
                        className="pl-10"
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Optional: Discounted rate for weekly rentals
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="depositAmount">Security Deposit</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden="true">{symbol}</span>
                    <Input
                        id="depositAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.depositAmount || ''}
                        onChange={(e) => handleNumberChange('depositAmount', e.target.value)}
                        placeholder="0.00"
                        className="pl-10"
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Refundable security deposit amount
                </p>
            </div>

            <div className="rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 mt-6">
                <h4 className="font-medium mb-2 text-slate-900 dark:text-slate-100">Pricing Summary</h4>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Daily Rate</span>
                        <span className="font-medium">{formatCurrencyWithDecimals(data.dailyRate || 0, currency)}</span>
                    </div>
                    {data.weeklyRate > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Weekly Rate</span>
                            <span className="font-medium">{formatCurrencyWithDecimals(data.weeklyRate, currency)}</span>
                        </div>
                    )}
                    {data.depositAmount > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Deposit</span>
                            <span className="font-medium">{formatCurrencyWithDecimals(data.depositAmount, currency)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}