import { ownValue } from '@/shared/lib/utils';
import type { StatusPresentation } from '@/shared/types';
import { CAR_SERVICE_STATUS_LABELS, CAR_STATUS_LABELS } from './status-labels';
import type { CarStatus } from './types';

const CAR_STATUS_TONES: Record<CarStatus, StatusPresentation['tone']> = {
    AVAILABLE: 'success',
    MAINTENANCE: 'warning',
    DAMAGED: 'danger',
    INSPECTION: 'neutral',
};

export function carStatusPresentation(status: string | null | undefined): StatusPresentation {
    const tone = ownValue(CAR_STATUS_TONES, status);
    const label = ownValue(CAR_STATUS_LABELS, status);
    if (tone === undefined || label === undefined) return { label: status || 'Unknown', tone: 'neutral' };
    return { label, tone };
}

export function carServiceStatusPresentation(status: string | null | undefined): StatusPresentation {
    const base = carStatusPresentation(status);
    return { ...base, label: ownValue(CAR_SERVICE_STATUS_LABELS, status) ?? base.label };
}
