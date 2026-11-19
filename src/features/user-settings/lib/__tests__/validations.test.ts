import { describe, it, expect } from 'vitest';
import { passwordChangeSchema, resetPasswordSchema } from '../validations';

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
