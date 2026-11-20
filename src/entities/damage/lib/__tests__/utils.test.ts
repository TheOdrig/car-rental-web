import { describe, expect, it } from 'vitest';
import { getDamageStatusColor } from '../utils';
import type { DamageStatus } from '../../model/types';

const STATUSES: DamageStatus[] = ['REPORTED', 'UNDER_ASSESSMENT', 'ASSESSED', 'CHARGED', 'DISPUTED', 'RESOLVED'];

describe('getDamageStatusColor', () => {
    it.each(STATUSES)('gives %s an explicit light and dark background and text', (status) => {
        const classes = getDamageStatusColor(status);
        expect(classes).toMatch(/(^| )bg-/);
        expect(classes).toMatch(/dark:bg-/);
        expect(classes).toMatch(/(^| )text-/);
        expect(classes).toMatch(/dark:text-/);
    });

    it('does not paint Resolved with the page background in dark mode', () => {
        expect(getDamageStatusColor('RESOLVED')).not.toMatch(/dark:bg-(gray|slate|zinc|neutral)-(900|950)/);
    });
});
