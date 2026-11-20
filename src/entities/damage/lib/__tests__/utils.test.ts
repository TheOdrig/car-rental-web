import { describe, expect, it } from 'vitest';
import { getDamageSeverityLabel, getDamageStatusLabel } from '../utils';
import { damageSeverityPresentation, damageStatusPresentation } from '../../model/status-presentation';
import { DAMAGE_SEVERITIES, DAMAGE_STATUSES } from '../../model/types';

describe('damage status presentation', () => {
    it.each(DAMAGE_STATUSES)('gives %s a label and a tone', (status) => {
        const presentation = damageStatusPresentation(status);
        expect(presentation.label).toBe(getDamageStatusLabel(status));
        expect(presentation.tone).toBeDefined();
    });

    it('shows a resolved report as neutral rather than as a live problem', () => {
        expect(damageStatusPresentation('RESOLVED').tone).toBe('neutral');
        expect(damageStatusPresentation('DISPUTED').tone).toBe('danger');
    });

    it.each(DAMAGE_SEVERITIES)('gives %s a label and a tone', (severity) => {
        expect(damageSeverityPresentation(severity).label).toBe(getDamageSeverityLabel(severity));
    });

    it('escalates severity from success to danger', () => {
        expect(damageSeverityPresentation('MINOR').tone).toBe('success');
        expect(damageSeverityPresentation('TOTAL_LOSS').tone).toBe('danger');
    });
});
