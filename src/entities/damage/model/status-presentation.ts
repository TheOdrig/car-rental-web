import { ownValue } from '@/shared/lib/utils';
import type { StatusPresentation } from '@/shared/types';
import type { DamageSeverity, DamageStatus } from './types';

const DAMAGE_STATUS_PRESENTATION: Readonly<Record<DamageStatus, StatusPresentation>> = {
    REPORTED: { label: 'Reported', tone: 'warning' },
    UNDER_ASSESSMENT: { label: 'Under Assessment', tone: 'info' },
    ASSESSED: { label: 'Assessed', tone: 'info' },
    CHARGED: { label: 'Charged', tone: 'success' },
    DISPUTED: { label: 'Disputed', tone: 'danger' },
    RESOLVED: { label: 'Resolved', tone: 'neutral' },
};

const DAMAGE_SEVERITY_PRESENTATION: Readonly<Record<DamageSeverity, StatusPresentation>> = {
    MINOR: { label: 'Minor', tone: 'success' },
    MODERATE: { label: 'Moderate', tone: 'warning' },
    MAJOR: { label: 'Major', tone: 'danger' },
    TOTAL_LOSS: { label: 'Total Loss', tone: 'danger' },
};

export const UNKNOWN_DAMAGE_STATUS: StatusPresentation = { label: 'Unknown', tone: 'neutral' };
export const UNASSESSED_DAMAGE_SEVERITY: StatusPresentation = { label: 'Not assessed', tone: 'neutral' };

export function damageStatusPresentation(status: DamageStatus | string | null | undefined): StatusPresentation {
    return ownValue(DAMAGE_STATUS_PRESENTATION, status) ?? UNKNOWN_DAMAGE_STATUS;
}

export function damageSeverityPresentation(severity: DamageSeverity | string | null | undefined): StatusPresentation {
    return ownValue(DAMAGE_SEVERITY_PRESENTATION, severity) ?? UNASSESSED_DAMAGE_SEVERITY;
}
