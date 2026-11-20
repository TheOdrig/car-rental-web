import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('toaster placement', () => {
    it('sits below the sticky navbar on desktop and mobile, clear of the safe area', () => {
        const layout = readFileSync('src/app/layout.tsx', 'utf8');
        const toaster = layout.match(/<Toaster[^>]*\/>/)?.[0] ?? '';

        for (const prop of ['offset', 'mobileOffset']) {
            const value = toaster.match(new RegExp(String.raw`\b${prop}="calc\((\d+)px \+ env\(safe-area-inset-top\)\)"`));
            expect(value, prop).not.toBeNull();
            expect(Number(value![1])).toBeGreaterThanOrEqual(72);
        }
    });
});
