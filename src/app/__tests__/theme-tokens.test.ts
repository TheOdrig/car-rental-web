import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(__dirname, '../globals.css'), 'utf8');

function block(selector: string): string {
    const start = css.indexOf(`${selector} {`);
    expect(start).toBeGreaterThanOrEqual(0);
    return css.slice(start, css.indexOf('\n}', start));
}

function declarations(text: string): Map<string, string> {
    const entries = [...text.matchAll(/^\s*(--[\w-]+):\s*(.+?);\s*$/gm)];
    return new Map(entries.map((match) => [match[1], match[2]]));
}

describe('theme tokens', () => {
    const theme = new Map([...declarations(block('@theme inline'))].filter(([name]) => name.startsWith('--color-')));
    const light = declarations(block(':root'));
    const dark = declarations(block('.dark'));

    it('maps every utility colour to a runtime variable instead of a literal', () => {
        expect(theme.size).toBeGreaterThan(20);
        for (const [name, value] of theme) {
            expect(value, name).toMatch(/^var\(--[\w-]+\)$/);
        }
    });

    it('defines every mapped variable for both light and dark', () => {
        for (const value of theme.values()) {
            const variable = /var\((--[\w-]+)\)/.exec(value)![1];
            expect(light.has(variable), `${variable} in :root`).toBe(true);
            expect(dark.has(variable), `${variable} in .dark`).toBe(true);
        }
    });

    it('uses a different foreground and background in dark mode', () => {
        expect(dark.get('--background')).toBeDefined();
        expect(dark.get('--background')).not.toBe(light.get('--background'));
        expect(dark.get('--foreground')).not.toBe(light.get('--foreground'));
    });
});
