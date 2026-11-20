import { describe, expect, it } from 'vitest';
import {
    canAssessDamage,
    canChargeDamage,
    canDisputeDamage,
    canReassessDamage,
    canResolveDamageDispute,
    hasDisputeActivity,
} from '../damage-rules';

describe('damage rules', () => {
    it('allows assessment only before an assessment exists', () => {
        expect(canAssessDamage({ status: 'REPORTED' })).toBe(true);
        expect(canAssessDamage({ status: 'UNDER_ASSESSMENT' })).toBe(true);
        expect(canAssessDamage({ status: 'ASSESSED' })).toBe(false);
    });

    it('allows reassessment, resolution and dispute from their own states only', () => {
        expect(canReassessDamage({ status: 'ASSESSED' })).toBe(true);
        expect(canReassessDamage({ status: 'CHARGED' })).toBe(false);
        expect(canResolveDamageDispute({ status: 'DISPUTED' })).toBe(true);
        expect(canResolveDamageDispute({ status: 'ASSESSED' })).toBe(false);
        expect(canDisputeDamage({ status: 'CHARGED' })).toBe(true);
        expect(canDisputeDamage({ status: 'DISPUTED' })).toBe(false);
    });

    it('charges only assessed damages with customer liability', () => {
        expect(canChargeDamage({ status: 'ASSESSED', customerLiability: 50 })).toBe(true);
        expect(canChargeDamage({ status: 'ASSESSED', customerLiability: 0 })).toBe(false);
        expect(canChargeDamage({ status: 'ASSESSED' })).toBe(false);
        expect(canChargeDamage({ status: 'CHARGED', customerLiability: 50 })).toBe(false);
    });

    it('detects dispute activity from any dispute or resolution field, including a zero refund', () => {
        expect(hasDisputeActivity({})).toBe(false);
        expect(hasDisputeActivity({ disputeReason: 'x' })).toBe(true);
        expect(hasDisputeActivity({ refundAmount: 0 })).toBe(true);
    });
});
