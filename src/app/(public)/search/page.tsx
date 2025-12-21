import type { Metadata } from 'next';
import { CarSearch } from '@/components/cars';
import { SearchContent } from './search-content';

export const metadata: Metadata = {
    title: 'Search Available Cars | Car Rental',
    description: 'Find and book available cars for your travel dates. Wide selection of vehicles to choose from.',
};

export default function SearchPage() {
    return (
        <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Search Results</h1>
                <CarSearch variant="compact" />
            </div>
            <SearchContent />
        </main>
    );
}
