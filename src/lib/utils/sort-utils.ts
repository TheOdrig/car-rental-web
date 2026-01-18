
import { SortOption } from '@/lib/stores/filter-store';

export function getSortParams(sortBy: SortOption): [string, string] {
    switch (sortBy) {
        case 'price-asc':
            return ['price', 'asc'];
        case 'price-desc':
            return ['price', 'desc'];
        case 'name-asc':
            return ['brand', 'asc'];
        case 'rating-desc':
            return ['rating', 'desc'];
        case 'recommended':
        default:
            return ['createTime', 'desc'];
    }
}
