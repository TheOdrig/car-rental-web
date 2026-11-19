import { formatDistanceToNow } from 'date-fns';
import type { CurrencyType } from '@/shared/types';

const LOCALE = 'en-US';
const MISSING = 'N/A';

export interface FormatCurrencyOptions {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
}

export function formatCurrency(
    amount: number,
    currency: CurrencyType | string = 'USD',
    options: FormatCurrencyOptions = {}
): string {
    const { minimumFractionDigits, maximumFractionDigits, showSymbol = true } = options;

    return new Intl.NumberFormat(LOCALE, {
        style: showSymbol ? 'currency' : 'decimal',
        currency: showSymbol ? currency : undefined,
        currencyDisplay: showSymbol ? 'narrowSymbol' : undefined,
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(amount);
}

export function formatCurrencyWithDecimals(
    amount: number,
    currency: CurrencyType | string = 'USD'
): string {
    return formatCurrency(amount, currency);
}

export function formatAmount(amount: number, currency?: CurrencyType | string | null): string {
    if (currency) return formatCurrency(amount, currency);
    return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 }).format(amount);
}

export function formatCompactCurrency(
    amount: number,
    currency: CurrencyType | string = 'USD'
): string {
    return new Intl.NumberFormat(LOCALE, {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
        notation: 'compact',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    }).format(amount);
}

export function getCurrencySymbol(currency: CurrencyType | string = 'USD'): string {
    const part = new Intl.NumberFormat(LOCALE, {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
    })
        .formatToParts(0)
        .find((entry) => entry.type === 'currency');
    return part?.value ?? currency;
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(LOCALE, options).format(value);
}

export function formatDailyPrice(
    amount: number,
    currency: CurrencyType | string = 'USD'
): string {
    return `${formatCurrency(amount, currency)}/day`;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export type DateInput = string | Date | null | undefined;

export function isDateOnly(value: DateInput): boolean {
    return typeof value === 'string' && DATE_ONLY.test(value.trim());
}

export function parseApiDate(value: DateInput): Date | null {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const text = value.trim();
    if (!text) return null;
    const parsed = new Date(DATE_ONLY.test(text) ? `${text}T00:00:00Z` : text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function format(value: DateInput, options: Intl.DateTimeFormatOptions): string {
    const parsed = parseApiDate(value);
    if (!parsed) return MISSING;
    const timeZone = isDateOnly(value) ? 'UTC' : undefined;
    return new Intl.DateTimeFormat(LOCALE, { ...options, timeZone }).format(parsed);
}

export function formatMonthShort(date: Date): string {
    return new Intl.DateTimeFormat(LOCALE, { month: 'short' }).format(date);
}

export function formatNumericDate(date: Date): string {
    return new Intl.DateTimeFormat(LOCALE).format(date);
}

export function formatDate(value: DateInput): string {
    return format(value, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(value: DateInput): string {
    return format(value, { month: 'short', day: 'numeric' });
}

export function formatWeekdayDate(value: DateInput): string {
    return format(value, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(value: DateInput): string {
    return format(value, { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDateTime(value: DateInput): string {
    return format(value, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

export function formatRelativeTime(
    value: DateInput,
    options?: { addSuffix?: boolean }
): string {
    const parsed = parseApiDate(value);
    if (!parsed) return MISSING;
    return formatDistanceToNow(parsed, options);
}

export function formatRentalReference(id: number | string | null | undefined): string {
    if (id === null || id === undefined || id === '') return MISSING;
    return `CR-${String(id).padStart(6, '0')}`;
}

export interface CurrencyAmount {
    currency?: string;
    totalSpent?: number;
}

export function formatAmountsByCurrency(entries: readonly CurrencyAmount[] | undefined): string[] {
    return (entries ?? [])
        .filter((entry): entry is CurrencyAmount & { currency: string } => Boolean(entry.currency))
        .map((entry) => formatCurrency(entry.totalSpent ?? 0, entry.currency));
}
