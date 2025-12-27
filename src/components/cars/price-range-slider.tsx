'use client';

import { useState, useCallback, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface PriceRangeSliderProps {
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: [number, number];
    value?: [number, number];
    onValueChange?: (value: [number, number]) => void;
    onValueCommit?: (value: [number, number]) => void;
    formatPrice?: (value: number) => string;
    className?: string;
}

const defaultFormatPrice = (value: number) => `$${value}`;

export function PriceRangeSlider({
    min = 0,
    max = 500,
    step = 10,
    defaultValue,
    value,
    onValueChange,
    onValueCommit,
    formatPrice = defaultFormatPrice,
    className,
}: PriceRangeSliderProps) {
    const [internalValue, setInternalValue] = useState<[number, number]>(
        defaultValue ?? [min, max]
    );

    const currentValue = useMemo(() =>
        value ?? internalValue,
        [value, internalValue]
    );

    const handleValueChange = useCallback(
        (newValue: number[]) => {
            const typedValue: [number, number] = [newValue[0], newValue[1]];
            if (!value) {
                setInternalValue(typedValue);
            }
            onValueChange?.(typedValue);
        },
        [value, onValueChange]
    );

    const handleValueCommit = useCallback(
        (newValue: number[]) => {
            const typedValue: [number, number] = [newValue[0], newValue[1]];
            onValueCommit?.(typedValue);
        },
        [onValueCommit]
    );

    return (
        <div className={cn('space-y-4', className)}>
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                    {formatPrice(currentValue[0])}
                </span>
                <span className="text-muted-foreground">—</span>
                <span className="font-medium text-foreground">
                    {formatPrice(currentValue[1])}
                </span>
            </div>
            <Slider
                min={min}
                max={max}
                step={step}
                value={currentValue}
                onValueChange={handleValueChange}
                onValueCommit={handleValueCommit}
                className="cursor-pointer"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatPrice(min)}</span>
                <span>{formatPrice(max)}</span>
            </div>
        </div>
    );
}
