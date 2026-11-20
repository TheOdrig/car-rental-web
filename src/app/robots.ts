import type { MetadataRoute } from 'next';
import { ROUTES } from '@/shared/config/routes';

const PRIVATE_PATHS = [
    ROUTES.admin.root,
    ROUTES.dashboard,
    '/api',
    ROUTES.rentals.list,
    ROUTES.damages.list,
    ROUTES.settings.root,
    ROUTES.checkout,
    ROUTES.booking.root,
    ROUTES.login,
    ROUTES.register,
    ROUTES.forgotPassword,
    ROUTES.resetPassword,
    ROUTES.forbidden,
];

export default function robots(): MetadataRoute.Robots {
    const base = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

    return {
        rules: [{ userAgent: '*', allow: '/', disallow: PRIVATE_PATHS }],
        sitemap: `${base}/sitemap.xml`,
    };
}
