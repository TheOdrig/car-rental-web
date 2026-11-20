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

export const PAGE_SIZE = {
    DEFAULT: 10,
    RENTAL_HISTORY: 10,
    CAR_LISTING: 12,
    ADMIN_FLEET: 25,
    ADMIN_USERS: 20,
    PENDING_QUEUE: 50,
} as const;

export const MAX_IMAGE_UPLOAD_MB = 5;
export const MAX_IMAGE_UPLOAD_BYTES = MAX_IMAGE_UPLOAD_MB * 1024 * 1024;

export const HERO_IMAGE_URL =
    'https://images.unsplash.com/photo-1639056067266-43a821cf0a1f?auto=format&fit=crop&q=80&w=2000';
export const AUTH_IMAGE_URL =
    'https://images.unsplash.com/photo-1705624843697-4461f9dce482?auto=format&fit=crop&q=80&w=1400';
