import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from '@/shared/config/constants';
import type { Currency, CurrencyCode } from '../model/types';

export { DEFAULT_CURRENCY };

export const RATES_BASE_CURRENCY: CurrencyCode = 'USD';

export const CURRENCIES: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
    { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
    { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0 },
];

export const CURRENCY_STORAGE_KEY = 'preferred_currency';

export const RATES_CACHE_DURATION = 60 * 60 * 1000;

export function getCurrencyByCode(code: CurrencyCode | string): Currency {
    const currency = CURRENCIES.find(c => c.code === code);
    return currency || CURRENCIES[0];
}

export function isValidCurrencyCode(code: string): code is CurrencyCode {
    return (SUPPORTED_CURRENCIES as readonly string[]).includes(code.toUpperCase());
}

export function mapCurrency(currency: string | undefined | null): CurrencyCode {
    if (!currency) return DEFAULT_CURRENCY;

    const upper = currency.toUpperCase();
    if (isValidCurrencyCode(upper)) {
        return upper as CurrencyCode;
    }

    return DEFAULT_CURRENCY;
}
export type RateSource = 'LIVE' | 'CACHED' | 'FALLBACK';

export function describeRateBasis(source: RateSource | undefined): string {
    switch (source) {
        case 'FALLBACK':
            return 'at a fixed reference rate, because live rates are unavailable';
        case 'CACHED':
            return 'at a recent approximate rate';
        default:
            return "at today's approximate rate";
    }
}


export function describeConversionBasis(source: RateSource | undefined): string {
    switch (source) {
        case 'FALLBACK':
            return 'at a fixed reference rate';
        case 'CACHED':
            return 'at a recent rate';
        default:
            return "at today's rate";
    }
}
