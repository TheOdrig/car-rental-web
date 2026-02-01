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