import type { MetadataRoute } from 'next';

const PRIVATE_PATHS = [
    '/admin',
    '/api',
    '/rentals',
    '/damages',
    '/settings',
    '/checkout',
    '/booking',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/forbidden',
];

export default function robots(): MetadataRoute.Robots {
    const base = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

    return {
        rules: [{ userAgent: '*', allow: '/', disallow: PRIVATE_PATHS }],
        host: base,
    };
}
