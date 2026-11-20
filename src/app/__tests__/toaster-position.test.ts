import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('toaster placement', () => {
    it('sits below the sticky navbar on desktop and mobile', () => {
        const layout = readFileSync('src/app/layout.tsx', 'utf8');
        const toaster = layout.match(/<Toaster[^>]*\/>/)?.[0] ?? '';

        expect(toaster).toMatch(/offset=\{(\d+)\}/);
        expect(Number(toaster.match(/\boffset=\{(\d+)\}/)?.[1])).toBeGreaterThanOrEqual(72);
        expect(Number(toaster.match(/mobileOffset=\{(\d+)\}/)?.[1])).toBeGreaterThanOrEqual(72);
    });
});
