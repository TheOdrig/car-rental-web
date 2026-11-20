import type { Metadata } from 'next';
import { CarsListingContent } from '../cars-listing-content';
import { pageMetadata } from '@/shared/lib';
import { ErrorBoundary } from '@/shared/ui/error-boundary';
import { ROUTES } from '@/shared/config/routes';

export const metadata: Metadata = pageMetadata({
    title: 'Browse Cars',
    description: 'Browse our full selection of rental cars. Filter by brand, type, transmission, and more to narrow the fleet down.',
    path: ROUTES.cars.list,
});

export default function CarsPage() {
    return (
        <ErrorBoundary>
            <CarsListingContent />
        </ErrorBoundary>
    );
}
