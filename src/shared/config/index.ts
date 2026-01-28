export const config = {
    api: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api',
        timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 5000,
    },
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
};
