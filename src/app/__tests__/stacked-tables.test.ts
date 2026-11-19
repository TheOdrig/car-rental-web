import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const TABLES = [
    'src/features/manage-fleet/ui/fleet-table.tsx',
    'src/features/manage-users/ui/user-table/user-table.tsx',
    'src/features/admin/ui/damage-table.tsx',
    'src/features/admin/ui/late-returns-table.tsx',
];

describe('stacked admin tables', () => {
    it('defines the stacked layout below the md breakpoint', () => {
        const css = readFileSync('src/app/globals.css', 'utf8');

        expect(css).toMatch(/@media \(max-width: 767px\)[\s\S]*\.stack-table tr/);
        expect(css).toContain('attr(data-label)');
    });

    it.each(TABLES)('%s opts in to the stacked layout', (file) => {
        expect(readFileSync(file, 'utf8')).toContain('className="stack-table"');
    });
});
