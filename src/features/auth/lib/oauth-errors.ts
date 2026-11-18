const OAUTH_ERROR_MESSAGES: Record<string, string> = {
    unsupported_provider: 'That sign-in provider is not supported.',
    oauth_unavailable: 'Social sign-in is not available right now. Please try again later or use your password.',
    invalid_callback: 'The sign-in response was incomplete. Please try again.',
    invalid_state: 'The sign-in request could not be verified. Please try again.',
    oauth_failed: 'Social sign-in failed. Please try again or use your password.',
    callback_failed: 'Social sign-in failed. Please try again or use your password.',
    authorization_denied: 'Sign-in was cancelled because access was not granted.',
    authentication_failed: 'The provider could not authenticate you. Please try again.',
    invalid_token: 'The provider session expired. Please try again.',
    provider_unavailable: 'The provider is temporarily unavailable. Please try again later.',
    email_required: 'The provider did not share an email address, which is required to sign in.',
    account_already_linked: 'That social account is already linked to another user.',
    social_login_required: 'This account signs in with a social provider. Use the provider button below.',
    local_account_unverified:
        'An account with this email exists but its email is not verified. Log in with your password and link the provider from your account.',
};

const GENERIC_OAUTH_ERROR = 'Social sign-in failed. Please try again or use your password.';

export function oauthErrorMessage(code: string | undefined): string | null {
    if (!code) {
        return null;
    }

    const key = code.toLowerCase();

    return Object.hasOwn(OAUTH_ERROR_MESSAGES, key) ? OAUTH_ERROR_MESSAGES[key] : GENERIC_OAUTH_ERROR;
}

export function isKnownOAuthErrorCode(code: string): boolean {
    return Object.hasOwn(OAUTH_ERROR_MESSAGES, code.toLowerCase());
}
