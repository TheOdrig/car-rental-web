import type { Metadata } from 'next';
import { CarsListingContent } from './cars-listing-content';

export const metadata: Metadata = {
    title: 'Browse Cars | Car Rental',
    description: 'Browse our full selection of rental cars. Filter by brand, type, transmission, and more to find your perfect vehicle.',
    openGraph: {
        title: 'Browse Cars | Car Rental',
        description: 'Browse our full selection of rental cars. Filter by brand, type, transmission, and more.',
    },
};

export default function CarsPage() {
    return <CarsListingContent />;
}
