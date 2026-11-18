import type { Schemas, WithRequired } from '@/shared/api/contract';

export type CurrencyCode = NonNullable<Schemas['ExchangeRatesResponse']['baseCurrency']>;

export interface Currency {
    code: CurrencyCode;
    name: string;
    symbol: string;
    flag: string;
    decimals: number;
}

export type ExchangeRatesResponse = Omit<
    WithRequired<Schemas['ExchangeRatesResponse'], 'baseCurrency' | 'timestamp' | 'source'>,
    'rates'
> & { rates: Record<CurrencyCode, number> };

export type ConversionRequest = Schemas['ConvertRequest'];

export type ConversionResponse = WithRequired<
    Schemas['ConversionResult'],
    'originalAmount' | 'originalCurrency' | 'convertedAmount' | 'targetCurrency' | 'exchangeRate' | 'rateTimestamp' | 'source'
>;