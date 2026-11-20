import type { Metadata } from 'next';
import { pageMetadata } from '@/shared/lib';
import { HomeContent } from './home-content';
import { ROUTES } from '@/shared/config/routes';

export const metadata: Metadata = pageMetadata({
    title: 'Car Rental - Rent a car by the day',
    absoluteTitle: true,
    description: 'Browse the fleet, request your dates and pay once the rental is approved.',
    path: ROUTES.home,
});

export default function HomePage() {
    return <HomeContent />;
}