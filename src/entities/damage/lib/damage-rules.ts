import type { DamageReport, DamageStatus } from '../model/types';

type DamageLike = Pick<DamageReport, 'status'>;

export function canAssessDamage(damage: DamageLike): boolean {
    const assessable: DamageStatus[] = ['REPORTED', 'UNDER_ASSESSMENT'];
    return assessable.includes(damage.status);
}

export function canReassessDamage(damage: DamageLike): boolean {
    return damage.status === 'ASSESSED';
}

export function canResolveDamageDispute(damage: DamageLike): boolean {
    return damage.status === 'DISPUTED';
}

export function canChargeDamage(damage: DamageLike & Pick<DamageReport, 'customerLiability'>): boolean {
    return damage.status === 'ASSESSED' && (damage.customerLiability ?? 0) > 0;
}

export function canDisputeDamage(damage: DamageLike): boolean {
    return damage.status === 'CHARGED';
}

export function hasDisputeActivity(
    damage: Pick<DamageReport, 'disputeReason' | 'disputeComments' | 'disputedAt' | 'resolutionNotes' | 'resolvedAt' | 'refundAmount'>,
): boolean {
    return Boolean(
        damage.disputeReason ||
            damage.disputeComments ||
            damage.disputedAt ||
            damage.resolutionNotes ||
            damage.resolvedAt ||
            damage.refundAmount !== undefined,
    );
}
