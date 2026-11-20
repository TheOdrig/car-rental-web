import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { damageSeverityPresentation, damageStatusPresentation } from '../status-presentation';
import { DamageSeverityBadge } from '../../ui/damage-severity-badge';
import { DamageStatusBadge } from '../../ui/damage-status-badge';
import { getDamageSeverityLabel, getDamageStatusLabel } from '../../lib/utils';

describe('damage presentation', () => {
    it('maps known codes', () => {
        expect(damageStatusPresentation('CHARGED')).toEqual({ label: 'Charged', tone: 'success' });
        expect(damageSeverityPresentation('MAJOR')).toEqual({ label: 'Major', tone: 'danger' });
    });

    it('falls back to a neutral presentation for null, undefined and unknown codes', () => {
        for (const value of [null, undefined, 'SOMETHING_NEW', 'toString', '__proto__']) {
            expect(damageStatusPresentation(value)).toEqual({ label: 'Unknown', tone: 'neutral' });
            expect(damageSeverityPresentation(value)).toEqual({ label: 'Not assessed', tone: 'neutral' });
        }
        expect(getDamageStatusLabel(null)).toBe('Unknown');
        expect(getDamageSeverityLabel(undefined)).toBe('Not assessed');
    });

    it('renders badges without throwing for a missing severity or status', () => {
        render(
            <>
                <DamageSeverityBadge severity={null} />
                <DamageStatusBadge status={null} />
            </>,
        );
        expect(screen.getByText('Not assessed')).toBeInTheDocument();
        expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
});
