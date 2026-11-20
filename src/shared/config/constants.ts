export const APP_NAME = 'Car Rental';

export const SUPPORTED_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP', 'JPY'] as const;
export const DEFAULT_CURRENCY = 'USD' satisfies (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_LOCALE = 'en-US';
