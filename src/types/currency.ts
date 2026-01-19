export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'TRY' | 'JPY';

export interface Currency {
    code: CurrencyCode;
    name: string;
    symbol: string;
    flag: string;
    decimals: number;
}

export interface ExchangeRatesResponse {
    baseCurrency: CurrencyCode;
    rates: Record<CurrencyCode, number>;
    timestamp: string;
    source: 'LIVE' | 'CACHE' | 'FALLBACK';
}

export interface ConversionRequest {
    amount: number;
    fromCurrency: CurrencyCode;
    toCurrency: CurrencyCode;
}

export interface ConversionResponse {
    originalAmount: number;
    originalCurrency: CurrencyCode;
    convertedAmount: number;
    targetCurrency: CurrencyCode;
    exchangeRate: number;
    rateTimestamp: string;
    source: 'LIVE' | 'CACHE' | 'FALLBACK';
}

export const CURRENCIES: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', decimals: 2 },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', decimals: 2 },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', decimals: 2 },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', decimals: 2 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', decimals: 0 },
];

export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

export const CURRENCY_STORAGE_KEY = 'preferred_currency';

export const RATES_CACHE_DURATION = 60 * 60 * 1000;

export function getCurrencyByCode(code: CurrencyCode | string): Currency {
    const currency = CURRENCIES.find(c => c.code === code);
    return currency || CURRENCIES[0];
}

export function isValidCurrencyCode(code: string): code is CurrencyCode {
    return ['USD', 'EUR', 'GBP', 'TRY', 'JPY'].includes(code.toUpperCase());
}

export function mapCurrency(currency: string | undefined | null): CurrencyCode {
    if (!currency) return 'USD';

    const upper = currency.toUpperCase();
    if (isValidCurrencyCode(upper)) {
        return upper as CurrencyCode;
    }

    return 'USD';
}
