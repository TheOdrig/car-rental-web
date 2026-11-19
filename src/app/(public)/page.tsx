import type { Metadata } from 'next';
import { pageMetadata } from '@/shared/lib';
import { HomeContent } from './home-content';

export const metadata: Metadata = pageMetadata({
    title: 'Car Rental - Find Your Perfect Ride',
    absoluteTitle: true,
    description: 'Browse our collection of premium vehicles and book your next adventure. Wide selection of cars available for rent.',
    path: '/',
});

export default function HomePage() {
    return <HomeContent />;
}