export type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

export interface PaymentMethod {
    id: string;
    cardType: CardType;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    cardholderName: string;
    isDefault: boolean;
    createdAt: string;
}

export interface AddCardRequest {
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvc: string;
    cardholderName: string;
    setAsDefault?: boolean;
}

export interface PaymentMethodsResponse {
    methods: PaymentMethod[];
}

