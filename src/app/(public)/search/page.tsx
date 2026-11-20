import type { Metadata } from 'next';
import { pageMetadata } from '@/shared/lib';
import { CarSearch } from '@/widgets/car-search';
import { SearchContent } from './search-content';
import { PageHeader } from '@/shared/ui/page-header';

export const metadata: Metadata = pageMetadata({
    title: 'Search Available Cars',
    description: 'Find and book available cars for your travel dates. Wide selection of vehicles to choose from.',
    path: '/search',
});

export default function SearchPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader area="public" className="mb-4" title="Search Results" />
            <div className="mb-8">
                <CarSearch variant="compact" />
            </div>
            <SearchContent />
        </div>
    );
}
