export {
    LoginSchema,
    RegisterSchema,
    type LoginRequest,
    type RegisterRequest,
    type AuthResponse,
    type Role,
    type UserSummary,
    type User,
    type RefreshTokenRequest,
    type LinkAccountResponse,
    type PasswordChangeRequest,
    type MeResponse,
    type LoginResponse,
    type LogoutResponse,
    type AuthContextValue,
    type PasswordStrength,
    type FieldValidationState,
    type FormValidationState,
    type FormMessage,
    type UserProfile,
    type ProfileUpdateData,
    type PasswordChangeData,
    type AvatarUploadResponse,
    type ForgotPasswordRequest,
    type ResetPasswordRequest,
    type MessageResponse,
} from './model/types';

export { login, register, logout, handleAuthError } from './api/auth-api';
export { LoginForm } from './ui/login-form';
export { RegisterForm } from './ui/register-form';
export { ForgotPasswordForm } from './ui/forgot-password-form';
export { ResetPasswordForm } from './ui/reset-password-form';
export { OAuthButtons, OAuthDivider } from './ui/oauth-buttons';
export { FormError } from './ui/form-error';
export { FormSuccess } from './ui/form-success';
export { PasswordStrengthIndicator } from './ui/password-strength-indicator';
export { SessionKeeper } from './ui/session-keeper';

export { useAuth, useCurrentUser, useLogin, useLogout, useRefreshToken, useRegister, authKeys } from './lib/use-auth';
export { oauthErrorMessage, isKnownOAuthErrorCode } from './lib/oauth-errors';
export { useChangePassword } from './lib/use-password';
export { useForgotPassword, useResetPassword } from './lib/use-password-reset';
