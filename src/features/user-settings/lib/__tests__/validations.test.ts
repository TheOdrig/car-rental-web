import { describe, it, expect } from 'vitest';
import spec from '../../../../../contract/openapi.json';
import { PHONE_REGEX, passwordChangeSchema, profileSchema, resetPasswordSchema } from '../validations';

const long = 'a'.repeat(73);

describe('password schemas', () => {
    it('rejects a new password over 72 characters on change and reset', () => {
        const change = passwordChangeSchema.safeParse({ currentPassword: 'old', newPassword: long, confirmPassword: long });
        const reset = resetPasswordSchema.safeParse({ newPassword: long, confirmPassword: long });

        expect(change.success).toBe(false);
        expect(reset.success).toBe(false);
        expect(JSON.stringify(change.error?.issues)).toContain('at most 72 characters');
    });

    it('rejects a new password over 72 UTF-8 bytes', () => {
        const wide = 'ü'.repeat(40);
        const result = resetPasswordSchema.safeParse({ newPassword: wide, confirmPassword: wide });

        expect(result.success).toBe(false);
        expect(JSON.stringify(result.error?.issues)).toContain('72 bytes');
    });

    it('rejects a current password over 72 characters', () => {
        const result = passwordChangeSchema.safeParse({
            currentPassword: long,
            newPassword: 'Password123!',
            confirmPassword: 'Password123!',
        });

        expect(result.success).toBe(false);
    });

    it('still accepts 8 to 72 characters', () => {
        const ok = 'a'.repeat(72);
        expect(resetPasswordSchema.safeParse({ newPassword: ok, confirmPassword: ok }).success).toBe(true);
        expect(resetPasswordSchema.safeParse({ newPassword: 'short', confirmPassword: 'short' }).success).toBe(false);
    });
});

describe('profileSchema phone', () => {
    const parse = (phone: string) => profileSchema.safeParse({ firstName: 'Ada', lastName: 'Lovelace', phone }).success;

    it.each(['', '+905551234567', '5551234', '123456789012345', '+1234567', '555 123 4567', '+90 555 111 22 33', '+90-555-111-22-33', '(555) 123.4567'])('accepts %j', (phone) => {
        expect(parse(phone)).toBe(true);
    });

    it.each(['123456', '+12345', '0123456789', '+0123456789', '1234567890123456', 'abc', '+'])('rejects %j', (phone) => {
        expect(parse(phone)).toBe(false);
    });

    it('uses the same rule as the API contract', () => {
        const contract = (spec as unknown as { components: { schemas: Record<string, { properties: Record<string, { pattern: string }> }> } })
            .components.schemas.ProfileUpdateRequest.properties.phone.pattern;
        const server = new RegExp(contract);

        for (const phone of ['', '+905551234567', '5551234', '123456', '+12345', '0123456789', '1234567890123456', 'abc']) {
            expect(server.test(phone), phone).toBe(phone === '' || PHONE_REGEX.test(phone));
        }
    });
});
