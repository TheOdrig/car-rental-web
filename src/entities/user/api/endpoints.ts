const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8082' : '');

export const USER_ENDPOINTS = {
    profile: `${API_BASE_URL}/api/users/me/profile`,
    avatar: `${API_BASE_URL}/api/users/me/avatar`,
    password: `${API_BASE_URL}/api/users/me/password`,
} as const;
