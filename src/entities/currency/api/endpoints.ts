export const CURRENCY_ENDPOINTS = {
    exchangeRates: `/api/exchange-rates`,
    refresh: `/api/exchange-rates/refresh`,
    convert: (amount: number, from: string, to: string) =>
        `/api/exchange-rates/convert?amount=${amount}&from=${from}&to=${to}`,
} as const;