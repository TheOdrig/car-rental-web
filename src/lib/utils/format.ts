import type { CurrencyType } from '@/types/common';

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
