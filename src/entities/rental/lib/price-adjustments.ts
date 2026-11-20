import type { PriceAdjustment } from '../model/types';

export function toPriceAdjustments(raw: ReadonlyArray<Partial<PriceAdjustment>> | null | undefined): PriceAdjustment[] {
    return (raw ?? []).flatMap((entry) =>
        entry.code && entry.label && typeof entry.amount === 'number'
            ? [{ code: entry.code, label: entry.label, amount: entry.amount, multiplier: entry.multiplier }]
            : []
    );
}
