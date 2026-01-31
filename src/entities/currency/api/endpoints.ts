const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8082' : '');

export const CURRENCY_ENDPOINTS = {
    exchangeRates: `${API_BASE_URL}/api/exchange-rates`,
    refresh: `${API_BASE_URL}/api/exchange-rates/refresh`,
    convert: (amount: number, from: string, to: string) =>
        `${API_BASE_URL}/api/exchange-rates/convert?amount=${amount}&from=${from}&to=${to}`,
} as const;