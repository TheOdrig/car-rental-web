export const AUTH_ENDPOINTS = {
    login: `/api/auth/login`,
    register: `/api/auth/register`,
    refresh: `/api/auth/refresh`,
    logout: `/api/auth/logout`,
    forgotPassword: `/api/auth/forgot-password`,
    resetPassword: `/api/auth/reset-password`,
    oauth: {
        authorize: (provider: string) => `/api/oauth2/authorize/${provider}`,
        callback: (provider: string) => `/api/oauth2/callback/${provider}`,
        link: (provider: string) => `/api/oauth2/link/${provider}`,
    },
    me: `/api/auth/me`,
} as const;