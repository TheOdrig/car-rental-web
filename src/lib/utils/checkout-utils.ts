import type {Addon, CardType, CurrencyType, PaymentErrorCode, PriceBreakdown,} from '@/types';

export function detectCardType(cardNumber: string): CardType {
    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';

    return 'unknown';
}

export function formatCardNumber(value: string): string {
    const cleanValue = value.replace(/\D/g, '');
    const maxLength = 16;
    const trimmed = cleanValue.slice(0, maxLength);
    const groups = trimmed.match(/.{1,4}/g);
    return groups ? groups.join(' ') : trimmed;
}

export function formatExpiryDate(value: string): string {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
        const month = cleanValue.slice(0, 2);
        const year = cleanValue.slice(2, 4);
        return year ? `${month}/${year}` : month;
    }
    return cleanValue;
}

export function formatCVC(value: string): string {
    return value.replace(/\D/g, '').slice(0, 4);
}

export function parseExpiryDate(expiry: string): { month: number; year: number } | null {
    const parts = expiry.split('/');
    if (parts.length !== 2) return null;

    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10);

    if (isNaN(month) || isNaN(year)) return null;

    return { month, year };
}

export function validateCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (!/^\d+$/.test(cleanNumber)) return false;
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber[i], 10);

        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

export function validateExpiryDate(expiry: string): boolean {
    const parsed = parseExpiryDate(expiry);
    if (!parsed) return false;

    const { month, year } = parsed;

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    return !(year === currentYear && month < currentMonth);


}

export function validateCVC(cvc: string, cardType: CardType = 'unknown'): boolean {
    const cleanCVC = cvc.replace(/\D/g, '');

    if (cardType === 'amex') {
        return cleanCVC.length === 4;
    }

    return cleanCVC.length === 3;
}

export function calculatePriceBreakdown(
    dailyRate: number,
    days: number,
    addons: Addon[],
    currency: CurrencyType = 'USD',
    taxRate: number = 0.12
): PriceBreakdown {
    const rentalCost = dailyRate * days;
    const addonsCost = addons.reduce(
        (sum, addon) => sum + addon.pricePerDay * days,
        0
    );
    const subtotal = rentalCost + addonsCost;
    const taxesAndFees = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + taxesAndFees) * 100) / 100;

    return {
        rentalDays: days,
        dailyRate,
        rentalCost,
        taxesAndFees,
        addonsCost,
        addonsDetail: addons.map((addon) => ({
            name: addon.name,
            cost: addon.pricePerDay * days,
        })),
        total,
        currency,
    };
}

export function calculateRentalDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(diffDays, 1);
}

export function getPaymentErrorMessage(code: PaymentErrorCode): string {
    const messages: Record<PaymentErrorCode, string> = {
        card_declined: 'Your card was declined. Please try a different card.',
        insufficient_funds:
            'Insufficient funds. Please use a different payment method.',
        expired_card: 'This card has expired. Please use a different card.',
        invalid_cvc: 'The CVC code is invalid. Please check and try again.',
        processing_error:
            'An error occurred while processing your payment. Please try again.',
        timeout: 'The payment request timed out. Please try again.',
    };

    return messages[code] || 'An unexpected error occurred.';
}

export function maskCardNumber(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 4) return cardNumber;

    const last4 = cleanNumber.slice(-4);
    return '•••• •••• •••• ' + last4;
}

export function getCardTypeIcon(cardType: CardType): string {
    const icons: Record<CardType, string> = {
        visa: 'visa',
        mastercard: 'mastercard',
        amex: 'amex',
        discover: 'discover',
        unknown: 'credit-card',
    };
    return icons[cardType];
}

export function formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length === 10) {
        return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
    }

    if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
        return `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
    }

    return phone;
}


export function generateBookingReference(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let reference = '';
    for (let i = 0; i < 8; i++) {
        reference += chars[Math.floor(Math.random() * chars.length)];
    }
    return reference;
}

export function validatePhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 7 && cleanPhone.length <= 15;
}


export const DEFAULT_ADDONS: Addon[] = [
    {
        id: 'cdw',
        name: 'Collision Damage Waiver',
        description: 'Full coverage for collision damage with zero deductible.',
        pricePerDay: 15,
        icon: 'shield-check',
        popular: true,
    },
    {
        id: 'gps',
        name: 'GPS Navigation System',
        description: 'Reliable navigation with offline maps and live traffic.',
        pricePerDay: 5,
        icon: 'navigation',
        popular: false,
    },
    {
        id: 'child-seat',
        name: 'Child Safety Seat',
        description: 'Certified child safety seat for ages 1-7.',
        pricePerDay: 10,
        icon: 'baby',
        popular: false,
    },
    {
        id: 'additional-driver',
        name: 'Additional Driver',
        description: 'Add a second authorized driver to the rental agreement.',
        pricePerDay: 8,
        icon: 'users',
        popular: false,
    },
];

export const TAX_RATES: Record<string, number> = {
    US: 0.12,
    EU: 0.2,
    UK: 0.2,
    DEFAULT: 0.12,
};

