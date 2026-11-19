export type { CurrencyCode, Currency, ExchangeRatesResponse, ConversionRequest, ConversionResponse } from './model/types';

export {
    CURRENCIES,
    DEFAULT_CURRENCY,
    CURRENCY_STORAGE_KEY,
    RATES_CACHE_DURATION,
    getCurrencyByCode,
    isValidCurrencyCode,
    mapCurrency,
    describeRateBasis,
    type RateSource,
} from './lib/utils';

export { CurrencyProvider, useCurrency } from './ui/currency-provider';