import { describe, it, expect} from 'vitest';
import {
    detectCardType,
    formatCardNumber,
    formatExpiryDate,
    formatCVC,
    parseExpiryDate,
    validateCardNumber,
    validateExpiryDate,
    validateCVC,
    calculatePriceBreakdown,
    calculateRentalDays,
    getPaymentErrorMessage,
    maskCardNumber,
    getCardTypeIcon,
    formatPhoneNumber,
    generateBookingReference,
    validatePhoneNumber,
    DEFAULT_ADDONS,
} from '@/lib/utils/checkout-utils';
import type { Addon } from '@/types';

describe('checkout-utils', () => {
    describe('detectCardType', () => {
        it('should detect Visa cards (starting with 4)', () => {
            expect(detectCardType('4111111111111111')).toBe('visa');
            expect(detectCardType('4000 0000 0000 0000')).toBe('visa');
            expect(detectCardType('4')).toBe('visa');
        });

        it('should detect Mastercard (starting with 51-55)', () => {
            expect(detectCardType('5111111111111111')).toBe('mastercard');
            expect(detectCardType('5500 0000 0000 0004')).toBe('mastercard');
            expect(detectCardType('52')).toBe('mastercard');
        });

        it('should detect Amex (starting with 34 or 37)', () => {
            expect(detectCardType('341111111111111')).toBe('amex');
            expect(detectCardType('3700 000000 00002')).toBe('amex');
        });

        it('should detect Discover (starting with 6011 or 65)', () => {
            expect(detectCardType('6011111111111117')).toBe('discover');
            expect(detectCardType('6500000000000000')).toBe('discover');
        });

        it('should return unknown for unrecognized cards', () => {
            expect(detectCardType('9999999999999999')).toBe('unknown');
            expect(detectCardType('')).toBe('unknown');
            expect(detectCardType('123')).toBe('unknown');
        });
    });

    describe('formatCardNumber', () => {
        it('should format card number with spaces every 4 digits', () => {
            expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
        });

        it('should remove non-digit characters', () => {
            expect(formatCardNumber('4111-1111-1111-1111')).toBe('4111 1111 1111 1111');
            expect(formatCardNumber('4111 1111 1111 1111')).toBe('4111 1111 1111 1111');
        });

        it('should handle partial card numbers', () => {
            expect(formatCardNumber('4111')).toBe('4111');
            expect(formatCardNumber('41111111')).toBe('4111 1111');
        });

        it('should limit to 16 digits', () => {
            expect(formatCardNumber('41111111111111111234')).toBe('4111 1111 1111 1111');
        });

        it('should handle empty string', () => {
            expect(formatCardNumber('')).toBe('');
        });
    });

    describe('formatExpiryDate', () => {
        it('should format expiry date as MM/YY', () => {
            expect(formatExpiryDate('1225')).toBe('12/25');
        });

        it('should handle partial input', () => {
            expect(formatExpiryDate('1')).toBe('1');
            expect(formatExpiryDate('12')).toBe('12');
            expect(formatExpiryDate('123')).toBe('12/3');
        });

        it('should remove non-digit characters', () => {
            expect(formatExpiryDate('12/25')).toBe('12/25');
            expect(formatExpiryDate('12-25')).toBe('12/25');
        });

        it('should handle empty string', () => {
            expect(formatExpiryDate('')).toBe('');
        });
    });

    describe('formatCVC', () => {
        it('should keep only digits', () => {
            expect(formatCVC('123')).toBe('123');
            expect(formatCVC('1234')).toBe('1234');
        });

        it('should limit to 4 digits', () => {
            expect(formatCVC('12345')).toBe('1234');
        });

        it('should remove non-digit characters', () => {
            expect(formatCVC('12a3')).toBe('123');
        });
    });

    describe('parseExpiryDate', () => {
        it('should parse valid expiry date', () => {
            expect(parseExpiryDate('12/25')).toEqual({ month: 12, year: 25 });
            expect(parseExpiryDate('01/30')).toEqual({ month: 1, year: 30 });
        });

        it('should return null for invalid format', () => {
            expect(parseExpiryDate('1225')).toBeNull();
            expect(parseExpiryDate('12-25')).toBeNull();
            expect(parseExpiryDate('')).toBeNull();
        });

        it('should return null for non-numeric values', () => {
            expect(parseExpiryDate('ab/cd')).toBeNull();
        });
    });

    describe('validateCardNumber', () => {
        it('should validate correct card numbers using Luhn algorithm', () => {
            expect(validateCardNumber('4111111111111111')).toBe(true);
            expect(validateCardNumber('5500000000000004')).toBe(true);
            expect(validateCardNumber('378282246310005')).toBe(true);
        });

        it('should reject invalid card numbers', () => {
            expect(validateCardNumber('4111111111111112')).toBe(false);
            expect(validateCardNumber('1234567890123456')).toBe(false);
        });

        it('should handle card numbers with spaces', () => {
            expect(validateCardNumber('4111 1111 1111 1111')).toBe(true);
        });

        it('should reject too short card numbers', () => {
            expect(validateCardNumber('411111111111')).toBe(false);
        });

        it('should reject non-numeric characters', () => {
            expect(validateCardNumber('4111-1111-1111-1111')).toBe(false);
            expect(validateCardNumber('abcdefghijklmnop')).toBe(false);
        });

        it('should reject empty string', () => {
            expect(validateCardNumber('')).toBe(false);
        });
    });

    describe('validateExpiryDate', () => {
        it('should accept future dates', () => {
            expect(validateExpiryDate('12/99')).toBe(true);
        });

        it('should reject past dates', () => {
            expect(validateExpiryDate('01/20')).toBe(false);
            expect(validateExpiryDate('12/22')).toBe(false);
        });

        it('should reject invalid months', () => {
            expect(validateExpiryDate('13/25')).toBe(false);
            expect(validateExpiryDate('00/25')).toBe(false);
        });

        it('should reject invalid format', () => {
            expect(validateExpiryDate('1225')).toBe(false);
            expect(validateExpiryDate('')).toBe(false);
        });
    });

    describe('validateCVC', () => {
        it('should validate 3-digit CVC for non-Amex cards', () => {
            expect(validateCVC('123', 'visa')).toBe(true);
            expect(validateCVC('456', 'mastercard')).toBe(true);
            expect(validateCVC('789', 'unknown')).toBe(true);
        });

        it('should validate 4-digit CVC for Amex cards', () => {
            expect(validateCVC('1234', 'amex')).toBe(true);
        });

        it('should reject wrong length CVC', () => {
            expect(validateCVC('12', 'visa')).toBe(false);
            expect(validateCVC('1234', 'visa')).toBe(false);
            expect(validateCVC('123', 'amex')).toBe(false);
        });
    });

    describe('calculatePriceBreakdown', () => {
        const mockAddons: Addon[] = [
            { id: 'cdw', name: 'CDW', description: 'Coverage', pricePerDay: 15 },
            { id: 'gps', name: 'GPS', description: 'Navigation', pricePerDay: 5 },
        ];

        it('should calculate correct price breakdown', () => {
            const result = calculatePriceBreakdown(100, 3, [], 'USD', 0.12);

            expect(result.rentalDays).toBe(3);
            expect(result.dailyRate).toBe(100);
            expect(result.rentalCost).toBe(300);
            expect(result.taxesAndFees).toBe(36);
            expect(result.addonsCost).toBe(0);
            expect(result.total).toBe(336);
            expect(result.currency).toBe('USD');
        });

        it('should calculate price with addons', () => {
            const result = calculatePriceBreakdown(100, 3, mockAddons, 'USD', 0.12);

            expect(result.addonsCost).toBe(60);
            expect(result.taxesAndFees).toBe(43.2);
            expect(result.total).toBe(403.2);
        });

        it('should include addon details', () => {
            const result = calculatePriceBreakdown(100, 3, mockAddons, 'USD');

            expect(result.addonsDetail).toHaveLength(2);
            expect(result.addonsDetail[0]).toEqual({ name: 'CDW', cost: 45 });
            expect(result.addonsDetail[1]).toEqual({ name: 'GPS', cost: 15 });
        });

        it('should use default tax rate', () => {
            const result = calculatePriceBreakdown(100, 1, []);

            expect(result.taxesAndFees).toBe(12);
        });
    });

    describe('calculateRentalDays', () => {
        it('should calculate days between two dates', () => {
            const start = new Date('2025-01-01');
            const end = new Date('2025-01-05');

            expect(calculateRentalDays(start, end)).toBe(4);
        });

        it('should return 1 for same day rental', () => {
            const sameDay = new Date('2025-01-01');

            expect(calculateRentalDays(sameDay, sameDay)).toBe(1);
        });

        it('should return minimum 1 day', () => {
            const start = new Date('2025-01-05');
            const end = new Date('2025-01-01');

            expect(calculateRentalDays(start, end)).toBe(1);
        });
    });

    describe('getPaymentErrorMessage', () => {
        it('should return correct message for each error code', () => {
            expect(getPaymentErrorMessage('card_declined')).toContain('declined');
            expect(getPaymentErrorMessage('insufficient_funds')).toContain('Insufficient');
            expect(getPaymentErrorMessage('expired_card')).toContain('expired');
            expect(getPaymentErrorMessage('invalid_cvc')).toContain('CVC');
            expect(getPaymentErrorMessage('processing_error')).toContain('error');
            expect(getPaymentErrorMessage('timeout')).toContain('timed out');
        });
    });

    describe('maskCardNumber', () => {
        it('should mask all but last 4 digits', () => {
            expect(maskCardNumber('4111111111111111')).toBe('•••• •••• •••• 1111');
        });

        it('should handle card numbers with spaces', () => {
            expect(maskCardNumber('4111 1111 1111 1111')).toBe('•••• •••• •••• 1111');
        });

        it('should handle short card numbers', () => {
            expect(maskCardNumber('123')).toBe('123');
        });
    });

    describe('getCardTypeIcon', () => {
        it('should return correct icon for each card type', () => {
            expect(getCardTypeIcon('visa')).toBe('visa');
            expect(getCardTypeIcon('mastercard')).toBe('mastercard');
            expect(getCardTypeIcon('amex')).toBe('amex');
            expect(getCardTypeIcon('discover')).toBe('discover');
            expect(getCardTypeIcon('unknown')).toBe('credit-card');
        });
    });

    describe('formatPhoneNumber', () => {
        it('should format 10-digit US phone numbers', () => {
            expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
        });

        it('should format 11-digit US phone numbers with country code', () => {
            expect(formatPhoneNumber('15551234567')).toBe('+1 (555) 123-4567');
        });

        it('should return original for non-standard formats', () => {
            expect(formatPhoneNumber('+44 20 1234 5678')).toBe('+44 20 1234 5678');
        });
    });

    describe('generateBookingReference', () => {
        it('should generate 8-character reference', () => {
            const ref = generateBookingReference();
            expect(ref).toHaveLength(8);
        });

        it('should only contain alphanumeric characters', () => {
            const ref = generateBookingReference();
            expect(ref).toMatch(/^[A-Z0-9]+$/);
        });

        it('should generate unique references', () => {
            const refs = new Set();
            for (let i = 0; i < 100; i++) {
                refs.add(generateBookingReference());
            }
            expect(refs.size).toBeGreaterThan(95);
        });
    });

    describe('validatePhoneNumber', () => {
        it('should accept valid phone numbers', () => {
            expect(validatePhoneNumber('5551234567')).toBe(true);
            expect(validatePhoneNumber('+1-555-123-4567')).toBe(true);
            expect(validatePhoneNumber('+44 20 1234 5678')).toBe(true);
        });

        it('should reject too short phone numbers', () => {
            expect(validatePhoneNumber('123456')).toBe(false);
        });

        it('should reject too long phone numbers', () => {
            expect(validatePhoneNumber('1234567890123456')).toBe(false);
        });
    });

    describe('DEFAULT_ADDONS', () => {
        it('should have required addons', () => {
            expect(DEFAULT_ADDONS).toHaveLength(4);
            expect(DEFAULT_ADDONS.map((a) => a.id)).toContain('cdw');
            expect(DEFAULT_ADDONS.map((a) => a.id)).toContain('gps');
            expect(DEFAULT_ADDONS.map((a) => a.id)).toContain('child-seat');
            expect(DEFAULT_ADDONS.map((a) => a.id)).toContain('additional-driver');
        });

        it('should have CDW marked as popular', () => {
            const cdw = DEFAULT_ADDONS.find((a) => a.id === 'cdw');
            expect(cdw?.popular).toBe(true);
        });
    });
});
