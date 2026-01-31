const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8082' : '');

export const AUTH_ENDPOINTS = {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    refresh: `${API_BASE_URL}/api/auth/refresh`,
    forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
    oauth: {
        authorize: (provider: string) => `${API_BASE_URL}/api/oauth2/authorize/${provider}`,
        callback: (provider: string) => `${API_BASE_URL}/api/oauth2/callback/${provider}`,
        link: (provider: string) => `${API_BASE_URL}/api/oauth2/link/${provider}`,
    },
    me: `${API_BASE_URL}/api/auth/me`,
} as const;