import { describe, it, expect } from 'vitest';
import { RESET_LINK_EXPIRED, RESET_LINK_INVALID, describeResetLinkError } from '../reset-link-errors';

describe('describeResetLinkError', () => {
    it('does not claim an unknown token expired', () => {
        expect(describeResetLinkError('Invalid or expired password reset token')).toEqual({
            title: 'Link not valid',
            detail: RESET_LINK_INVALID,
        });
    });

    it('says expired only for an expired token', () => {
        expect(describeResetLinkError('Password reset token has expired')).toEqual({
            title: 'Link expired',
            detail: RESET_LINK_EXPIRED,
        });
    });

    it('leaves other errors alone', () => {
        expect(describeResetLinkError('Service unavailable')).toBeNull();
    });
});
