import { describe, it, expect } from 'vitest';
import { buildOptions } from '../specifications';

describe('buildOptions', () => {
    it('offers canonical capitalised values merged with what the fleet already uses', () => {
        const { options } = buildOptions(['Gasoline', 'Diesel'], ['diesel', 'LPG'], '');

        expect(options.map((option) => option.value)).toEqual(['Diesel', 'Gasoline', 'LPG']);
    });

    it('selects the canonical spelling of a stored value regardless of case', () => {
        expect(buildOptions(['Automatic', 'Manual'], undefined, 'manual').selected).toBe('Manual');
    });

    it('keeps an unknown stored value selectable', () => {
        const { options, selected } = buildOptions(['Sedan'], undefined, 'Roadster');

        expect(selected).toBe('Roadster');
        expect(options.map((option) => option.value)).toContain('Roadster');
    });
});
