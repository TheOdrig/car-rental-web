import { describe, it, expect } from 'vitest';
import { lintableFiles, touchesSource } from '../../scripts/pre-commit.mjs';

describe('pre-commit helpers', () => {
    it('lints staged source and script files but not generated code or docs', () => {
        expect(
            lintableFiles([
                'src/a.ts',
                'src/ui/b.tsx',
                'scripts/c.mjs',
                'src/shared/api/generated/openapi.ts',
                'docs/readme.md',
                'package.json',
            ]),
        ).toEqual(['src/a.ts', 'src/ui/b.tsx', 'scripts/c.mjs']);
    });

    it('runs the architecture tests only when source files are staged', () => {
        expect(touchesSource(['src/a.ts'])).toBe(true);
        expect(touchesSource(['package.json', 'scripts/c.mjs'])).toBe(false);
    });
});
