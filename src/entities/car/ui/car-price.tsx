'use client';

import { cn } from '@/shared/lib';
import { useCurrency, mapCurrency } from '@/entities/currency/@x/car';

type CurrencyCode = ReturnType<typeof mapCurrency>;

interface CarPriceAmountProps {
    amount: number;
    from: CurrencyCode;
    className?: string;
}

export function CarPriceAmount({ amount, from, className }: CarPriceAmountProps) {
    const { format, formatCompact } = useCurrency();
    const full = format(amount, from);
    const compact = formatCompact(amount, from);

    if (full === compact) {
        return <span className={className}>{full}</span>;
    }

    return (
        <>
            <span className={cn(className, 'sm:hidden')}>{compact}</span>
            <span className={cn(className, 'hidden sm:inline')}>{full}</span>
        </>
    );
}
