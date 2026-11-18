export const PAYMENT_ENDPOINTS = {
    intent: (rentalId: number) => `/api/rentals/${rentalId}/payment-intent`,
    byRental: (rentalId: number) => `/api/rentals/${rentalId}/payment`,
} as const;
