import { format, isValid, parseISO, formatDistanceToNow } from 'date-fns';
import type { CurrencyType } from '@/shared/types';

export interface FormatCurrencyOptions {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
}

function getLocaleForCurrency(currency: CurrencyType | string): string {
    return currency === 'TRY' ? 'tr-TR' : 'en-US';
}

export function formatCurrency(
    amount: number,
    currency: CurrencyType | string = 'USD',
    options: FormatCurrencyOptions = {}
): string {
    const {
        minimumFractionDigits = 0,
        maximumFractionDigits = 0,
        showSymbol = true,
    } = options;

    const locale = getLocaleForCurrency(currency);

    return new Intl.NumberFormat(locale, {
        style: showSymbol ? 'currency' : 'decimal',
        currency: showSymbol ? currency : undefined,
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(amount);
}

export function formatCurrencyWithDecimals(
    amount: number,
    currency: CurrencyType | string = 'USD'
): string {
    return formatCurrency(amount, currency, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function formatDailyPrice(
    amount: number,
    currency: CurrencyType | string = 'USD'
): string {
    return `${formatCurrency(amount, currency)}/day`;
}

export function safeFormatDate(
    date: string | Date | null | undefined,
    formatStr: string = 'MMM d, yyyy'
): string {
    if (!date) return 'N/A';

    const d = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(d)) return 'N/A';

    return format(d, formatStr);
}

export function safeFormatDateTime(
    date: string | Date | null | undefined
): string {
    return safeFormatDate(date, "MMM d, yyyy 'at' h:mm a");
}

export function safeFormatDistanceToNow(
    date: string | Date | null | undefined,
    options?: { addSuffix?: boolean }
): string {
    if (!date) return 'N/A';

    const d = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(d)) return 'N/A';

    return formatDistanceToNow(d, options);
}

export function formatDate(date: Date | string | null | undefined): string {
    return safeFormatDate(date, 'MMM d, yyyy');
}

export function formatTime(date: Date | string | null | undefined): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return 'N/A';
    return format(d, 'h:mm a');
}
export interface CurrencyAmount {
    currency?: string;
    totalSpent?: number;
}

export function formatAmountsByCurrency(entries: readonly CurrencyAmount[] | undefined): string[] {
    return (entries ?? [])
        .filter((entry): entry is CurrencyAmount & { currency: string } => Boolean(entry.currency))
        .map((entry) => formatCurrencyWithDecimals(entry.totalSpent ?? 0, entry.currency));
}
