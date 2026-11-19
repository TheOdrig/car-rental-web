import type { Metadata } from 'next';
import { CarsListingContent } from './cars-listing-content';
import { ErrorBoundary } from '@/shared/ui/error-boundary';

export const metadata: Metadata = {
    title: 'Browse Cars',
    description: 'Browse our full selection of rental cars. Filter by brand, type, transmission, and more to find your perfect vehicle.',
    openGraph: {
        title: 'Browse Cars',
        description: 'Browse our full selection of rental cars. Filter by brand, type, transmission, and more.',
    },
};

export default function CarsPage() {
    return (
        <ErrorBoundary>
            <CarsListingContent />
        </ErrorBoundary>
    );
}
