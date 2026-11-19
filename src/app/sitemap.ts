import type { MetadataRoute } from 'next';
import { API, upstream } from '@/shared/server';

export const revalidate = 3600;

const STATIC_PATHS = ['', '/cars', '/search', '/terms', '/privacy'];

interface CarPage {
    content?: Array<{ id?: number }>;
}

async function carIds(): Promise<number[]> {
    try {
        const page = await upstream.get<CarPage>(API.cars.list.resolve(), {
            anonymous: true,
            params: { size: 100 },
            tags: ['cars'],
        });
        return (page.content ?? []).flatMap((car) => (typeof car.id === 'number' ? [car.id] : []));
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const ids = await carIds();

    return [
        ...STATIC_PATHS.map((path) => ({ url: `${base}${path}` })),
        ...ids.map((id) => ({ url: `${base}/cars/${id}` })),
    ];
}
