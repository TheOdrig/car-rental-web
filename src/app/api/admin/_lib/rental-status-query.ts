import { toApiRentalStatus } from '@/entities/rental';

export function mapRentalStatusQuery(query: URLSearchParams): URLSearchParams {
    const mapped = new URLSearchParams(query);
    const status = mapped.get('status');

    if (status) {
        mapped.set('status', toApiRentalStatus(status));
    }

    return mapped;
}
