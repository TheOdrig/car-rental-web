'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CarFormData } from './types';

interface PricingSectionProps {
    data: CarFormData;
    errors: Partial<Record<keyof CarFormData, string>>;
    onUpdate: (field: keyof CarFormData, value: string | number) => void;
}

export function PricingSection({ data, errors, onUpdate }: PricingSectionProps) {
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
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
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
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
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
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
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

            <div className="rounded-lg bg-muted/50 p-4 mt-6">
                <h4 className="font-medium mb-2">Pricing Summary</h4>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Daily Rate</span>
                        <span className="font-medium">${(data.dailyRate || 0).toFixed(2)}</span>
                    </div>
                    {data.weeklyRate > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Weekly Rate</span>
                            <span className="font-medium">${data.weeklyRate.toFixed(2)}</span>
                        </div>
                    )}
                    {data.depositAmount > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Deposit</span>
                            <span className="font-medium">${data.depositAmount.toFixed(2)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
