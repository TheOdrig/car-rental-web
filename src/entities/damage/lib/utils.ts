import { damageSeverityPresentation, damageStatusPresentation } from '../model/status-presentation';
import type { DamageStatus, DamageSeverity, DamageCategory } from '../model/types';

export function getDamageCategoryLabel(category: DamageCategory): string {
    const labels: Record<DamageCategory, string> = {
        SCRATCH: 'Scratch',
        DENT: 'Dent',
        GLASS_DAMAGE: 'Glass Damage',
        TIRE_DAMAGE: 'Tire Damage',
        INTERIOR_DAMAGE: 'Interior Damage',
        MECHANICAL_DAMAGE: 'Mechanical Damage',
    };
    return labels[category];
}

export function getDamageStatusLabel(status: DamageStatus): string {
    return damageStatusPresentation(status).label;
}

export function getDamageSeverityLabel(severity: DamageSeverity): string {
    return damageSeverityPresentation(severity).label;
}
