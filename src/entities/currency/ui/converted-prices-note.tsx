'use client';

import { cn } from '@/shared/lib';
import type { CurrencyCode } from '../model/types';
import { describeConversionBasis } from '../lib/utils';
import { useCurrency } from './currency-provider';

interface ConvertedPricesNoteProps {
    from: CurrencyCode | readonly CurrencyCode[];
    className?: string;
}

function joinCodes(codes: CurrencyCode[]): string {
    if (codes.length <= 1) return codes.join('');
    return `${codes.slice(0, -1).join(', ')} and ${codes[codes.length - 1]}`;
}

export function ConvertedPricesNote({ from, className }: ConvertedPricesNoteProps) {
    const { isConverted, rateSource } = useCurrency();
    const sources = Array.from(new Set(Array.isArray(from) ? from : [from as CurrencyCode]));
    const converted = sources.filter((code) => isConverted(code));

    if (converted.length === 0) return null;

    return (
        <p className={cn('text-xs text-muted-foreground', className)} data-testid="converted-prices-note">
            Prices converted from {joinCodes(converted)} {describeConversionBasis(rateSource)}.
        </p>
    );
}
