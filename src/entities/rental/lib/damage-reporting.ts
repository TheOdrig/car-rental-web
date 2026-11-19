import type { AdminRentalStatus } from '../model/types';
import { parseApiDate } from '@/shared/lib/format';

export const DAMAGE_REPORT_WINDOW_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export function canReportDamage(status: AdminRentalStatus, returnedAt?: string, now: Date = new Date()): boolean {
    if (status === 'ACTIVE' || status === 'OVERDUE') return true;
    if (status !== 'COMPLETED') return false;

    const returned = parseApiDate(returnedAt);
    if (!returned) return true;

    return now.getTime() - returned.getTime() <= DAMAGE_REPORT_WINDOW_DAYS * DAY_MS;
}
