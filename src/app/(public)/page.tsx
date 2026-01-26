import type { Metadata } from 'next';
import { HomeContent } from './home-content';

export const metadata: Metadata = {
    title: 'Car Rental | Find Your Perfect Ride',
    description: 'Browse our collection of premium vehicles and book your next adventure. Wide selection of cars available for rent.',
};

export default function HomePage() {
    return <HomeContent />;
}

