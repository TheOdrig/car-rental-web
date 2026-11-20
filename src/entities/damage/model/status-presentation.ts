import type { StatusPresentation } from '@/shared/types';
import type { DamageSeverity, DamageStatus } from './types';

const DAMAGE_STATUS_PRESENTATION: Record<DamageStatus, StatusPresentation> = {
    REPORTED: { label: 'Reported', tone: 'warning' },
    UNDER_ASSESSMENT: { label: 'Under Assessment', tone: 'info' },
    ASSESSED: { label: 'Assessed', tone: 'info' },
    CHARGED: { label: 'Charged', tone: 'success' },
    DISPUTED: { label: 'Disputed', tone: 'danger' },
    RESOLVED: { label: 'Resolved', tone: 'neutral' },
};

const DAMAGE_SEVERITY_PRESENTATION: Record<DamageSeverity, StatusPresentation> = {
    MINOR: { label: 'Minor', tone: 'success' },
    MODERATE: { label: 'Moderate', tone: 'warning' },
    MAJOR: { label: 'Major', tone: 'danger' },
    TOTAL_LOSS: { label: 'Total Loss', tone: 'danger' },
};

export function damageStatusPresentation(status: DamageStatus): StatusPresentation {
    return DAMAGE_STATUS_PRESENTATION[status];
}

export function damageSeverityPresentation(severity: DamageSeverity): StatusPresentation {
    return DAMAGE_SEVERITY_PRESENTATION[severity];
}
