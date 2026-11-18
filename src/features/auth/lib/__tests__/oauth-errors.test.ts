import { describe, it, expect } from 'vitest';
import { isKnownOAuthErrorCode, oauthErrorMessage } from '../oauth-errors';

describe('oauthErrorMessage', () => {
    it('returns null when there is no error', () => {
        expect(oauthErrorMessage(undefined)).toBeNull();
        expect(oauthErrorMessage('')).toBeNull();
    });

    it.each([
        'unsupported_provider',
        'oauth_unavailable',
        'invalid_callback',
        'invalid_state',
        'oauth_failed',
        'callback_failed',
        'authorization_denied',
        'account_already_linked',
        'local_account_unverified',
    ])('explains the %s code', (code) => {
        expect(isKnownOAuthErrorCode(code)).toBe(true);
        expect(oauthErrorMessage(code)).toBeTruthy();
    });

    it('tells the user to log in with the password for an unverified local account', () => {
        expect(oauthErrorMessage('local_account_unverified')).toMatch(/password/i);
    });

    it('falls back to a generic message for unknown codes without echoing them', () => {
        const message = oauthErrorMessage('<b>x</b>');

        expect(message).toBe('Social sign-in failed. Please try again or use your password.');
        expect(message).not.toContain('<b>');
    });
});
