import { ownValue } from '@/shared/lib/utils';
import type { StatusPresentation } from '@/shared/types';
import type { AccountStatusType } from './types';

const ACCOUNT_STATUS_PRESENTATION: Record<AccountStatusType, StatusPresentation> = {
    ACTIVE: { label: 'Active', tone: 'success' },
    PENDING: { label: 'Pending', tone: 'warning' },
    BANNED: { label: 'Banned', tone: 'danger' },
    LOCKED: { label: 'Locked', tone: 'neutral' },
};

export function accountStatusPresentation(status: string | null | undefined): StatusPresentation {
    return ownValue(ACCOUNT_STATUS_PRESENTATION, status) ?? { label: status || 'Unknown', tone: 'neutral' };
}
