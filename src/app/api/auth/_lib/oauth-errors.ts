import { isApiError } from '@/shared/api';

const API_OAUTH_CODES: Readonly<Record<string, string>> = {
    OAUTH2_AUTHORIZATION_DENIED: 'authorization_denied',
    OAUTH2_AUTHENTICATION_FAILED: 'authentication_failed',
    OAUTH2_INVALID_TOKEN: 'invalid_token',
    OAUTH2_PROVIDER_UNAVAILABLE: 'provider_unavailable',
    OAUTH2_EMAIL_REQUIRED: 'email_required',
    OAUTH2_INVALID_STATE: 'invalid_state',
    OAUTH2_ACCOUNT_ALREADY_LINKED: 'account_already_linked',
    OAUTH2_SOCIAL_LOGIN_REQUIRED: 'social_login_required',
    OAUTH2_LOCAL_ACCOUNT_UNVERIFIED: 'local_account_unverified',
    OAUTH2_PROVIDER_NOT_SUPPORTED: 'unsupported_provider',
};

export function oauthRedirectCode(error: unknown): string {
    if (isApiError(error) && error.code) {
        const mapped = Object.hasOwn(API_OAUTH_CODES, error.code) ? API_OAUTH_CODES[error.code] : undefined;
        if (mapped) {
            return mapped;
        }
    }

    return 'callback_failed';
}

export function oauthProblemRedirectCode(body: unknown): string | null {
    if (typeof body !== 'object' || body === null) {
        return null;
    }
    const code = (body as { code?: unknown }).code;
    if (typeof code === 'string' && Object.hasOwn(API_OAUTH_CODES, code)) {
        return API_OAUTH_CODES[code] ?? null;
    }
    return null;
}
