import { describe, expect, it } from 'vitest';
import { paymentStatusPresentation } from '../status-presentation';

describe('paymentStatusPresentation', () => {
    it('maps known statuses', () => {
        expect(paymentStatusPresentation('CAPTURED').tone).toBe('success');
    });

    it('falls back to neutral for null, undefined and unknown statuses', () => {
        expect(paymentStatusPresentation(null)).toEqual({ label: 'Unknown', tone: 'neutral' });
        expect(paymentStatusPresentation(undefined)).toEqual({ label: 'Unknown', tone: 'neutral' });
        expect(paymentStatusPresentation('DISPUTED')).toEqual({ label: 'DISPUTED', tone: 'neutral' });
    });
});
