import type { DamageStatus, DamageSeverity, DamageCategory } from '../model/types';

export function getDamageStatusColor(status: DamageStatus): string {
    const colors: Record<DamageStatus, string> = {
        REPORTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        UNDER_ASSESSMENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        ASSESSED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        CHARGED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        DISPUTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        RESOLVED: 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-50',
    };
    return colors[status];
}

export function getDamageSeverityColor(severity: DamageSeverity): string {
    const colors: Record<DamageSeverity, string> = {
        MINOR: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        MODERATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        MAJOR: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        TOTAL_LOSS: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[severity];
}

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
    const labels: Record<DamageStatus, string> = {
        REPORTED: 'Reported',
        UNDER_ASSESSMENT: 'Under Assessment',
        ASSESSED: 'Assessed',
        CHARGED: 'Charged',
        DISPUTED: 'Disputed',
        RESOLVED: 'Resolved',
    };
    return labels[status];
}

export function getDamageSeverityLabel(severity: DamageSeverity): string {
    const labels: Record<DamageSeverity, string> = {
        MINOR: 'Minor',
        MODERATE: 'Moderate',
        MAJOR: 'Major',
        TOTAL_LOSS: 'Total Loss',
    };
    return labels[severity];
}