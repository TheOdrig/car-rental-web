import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return name === '__tests__' || name === 'generated' ? [] : sourceFiles(path);
        return path.endsWith('.tsx') ? [path] : [];
    });
}

describe('fill images', () => {
    it('always declare sizes', () => {
        const offenders: string[] = [];
        for (const file of sourceFiles('src')) {
            const source = readFileSync(file, 'utf8');
            for (const match of source.matchAll(/<(?:Dynamic)?Image\b[^>]*?\n\s*fill\s*\n[\s\S]*?\/>/g)) {
                if (!/\bsizes=/.test(match[0])) offenders.push(file);
            }
        }

        expect(offenders).toEqual([]);
    });
});
