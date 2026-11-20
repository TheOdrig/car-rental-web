import { RentalStatus } from '@/entities/rental';
import { parsePageIndex } from '@/shared/lib';

export type QueueFilter = 'all' | 'approvals' | 'pickups' | 'returns' | 'overdue';
export type Queue = Exclude<QueueFilter, 'all'>;
export type AdminRentalsView = 'pending' | 'all-rentals';

export const ALL_STATUSES = 'all';

export const QUEUE_FILTERS: Queue[] = ['approvals', 'pickups', 'returns', 'overdue'];

export const QUEUES: { key: Queue; label: string; noun: string }[] = [
    { key: 'approvals', label: 'Approvals', noun: 'approvals' },
    { key: 'pickups', label: 'Pickups', noun: 'pickups' },
    { key: 'returns', label: 'Returns', noun: 'returns' },
    { key: 'overdue', label: 'Overdue', noun: 'overdue rentals' },
];

export interface AdminRentalsState {
    userId: number | undefined;
    view: AdminRentalsView;
    rentalStatus: string;
    page: number;
    queue: QueueFilter;
}

export function parseAdminRentalsParams(params: URLSearchParams | null): AdminRentalsState {
    const userIdParam = params?.get('userId');
    const userId = userIdParam && /^[0-9]+$/.test(userIdParam) ? Number(userIdParam) : undefined;
    const statusParam = params?.get('status') ?? '';
    const queueParam = params?.get('queue') ?? '';
    return {
        userId,
        view: userId !== undefined || params?.get('view') === 'all' ? 'all-rentals' : 'pending',
        rentalStatus: (Object.values(RentalStatus) as string[]).includes(statusParam) ? statusParam : ALL_STATUSES,
        page: parsePageIndex(params?.get('page')),
        queue: (QUEUE_FILTERS as string[]).includes(queueParam) ? (queueParam as Queue) : 'all',
    };
}

export function buildAdminRentalsQuery(state: AdminRentalsState): string {
    const params = new URLSearchParams();
    if (state.userId !== undefined) params.set('userId', String(state.userId));
    if (state.view === 'all-rentals' && state.userId === undefined) params.set('view', 'all');
    if (state.view === 'all-rentals' && state.rentalStatus !== ALL_STATUSES) params.set('status', state.rentalStatus);
    if (state.view === 'all-rentals' && state.page > 0) params.set('page', String(state.page + 1));
    if (state.view === 'pending' && state.queue !== 'all') params.set('queue', state.queue);
    return params.toString();
}

export function queueCount(page: { totalElements?: number; content: unknown[] } | undefined): number {
    return page?.totalElements ?? page?.content.length ?? 0;
}

export function describeEmptyQueues(nouns: string[]): string {
    return nouns.join(', ').replace(/, ([^,]*)$/, ' or $1');
}
