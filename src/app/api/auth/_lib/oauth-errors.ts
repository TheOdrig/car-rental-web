import { isApiError } from '@/shared/api';

const API_OAUTH_CODES = new Set([
    'authorization_denied',
    'authentication_failed',
    'invalid_token',
    'provider_unavailable',
    'email_required',
    'invalid_state',
    'account_already_linked',
    'social_login_required',
    'local_account_unverified',
]);

export function oauthRedirectCode(error: unknown): string {
    if (isApiError(error) && error.code) {
        const code = error.code.toLowerCase();
        if (API_OAUTH_CODES.has(code)) {
            return code;
        }
    }

    return 'callback_failed';
}
