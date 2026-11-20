export const APP_NAME = 'Car Rental';

export const SUPPORTED_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP', 'JPY'] as const;
export const DEFAULT_CURRENCY = 'USD' satisfies (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_LOCALE = 'en-US';

export const STALE_TIME = {
    NONE: 0,
    SHORT: 30 * 1000,
    MINUTE: 60 * 1000,
    MEDIUM: 2 * 60 * 1000,
    LONG: 5 * 60 * 1000,
    EXTENDED: 10 * 60 * 1000,
    HOUR_HALF: 30 * 60 * 1000,
    FOREVER: Infinity,
} as const;
