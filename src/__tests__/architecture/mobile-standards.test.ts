import { describe, it, expect } from 'vitest';
import { sep } from 'path';
import { scanFiles, readFile } from './helpers/file-scanner';

const STATIC_VIEWPORT_HEIGHT = /(?<![\w-])(?:(?:[a-z-]+:)*(?:min-|max-)?h-screen)(?![\w-])|\b100vh\b/g;

const FORM_CONTROL_OVERRIDE = /<(?:Input|Textarea|SelectTrigger)\b[^>]*?className=(?:"[^"]*"|\{[^}]*\})/g;
const BARE_SMALL_TEXT = /(?<![:\w-])text-(?:xs|sm)(?![\w-])/;

const FORM_CONTROL_BASES: Array<{ file: string; description: string }> = [
  { file: 'src/shared/ui/input.tsx', description: 'Input' },
  { file: 'src/shared/ui/textarea.tsx', description: 'Textarea' },
  { file: 'src/shared/ui/select.tsx', description: 'SelectTrigger' },
];

function normalize(file: string): string {
  return file.split(sep).join('/');
}

function matches(pattern: RegExp, text: string): string[] {
  return [...text.matchAll(pattern)].map((match) => match[0]);
}

async function sourceFiles(glob: string): Promise<string[]> {
  return scanFiles(glob, { exclude: ['**/__tests__/**'] });
}

describe('Mobile viewport detectors', () => {
  it('flags static viewport heights', () => {
    for (const fixture of ['min-h-screen', 'h-screen', 'md:min-h-screen', 'max-h-screen', "minHeight: '100vh'", 'height: 100vh;']) {
      expect(matches(STATIC_VIEWPORT_HEIGHT, fixture), fixture).not.toEqual([]);
    }
    for (const fixture of ['min-h-dvh', 'h-dvh', "minHeight: '100dvh'", 'max-h-[calc(100dvh-2rem)]']) {
      expect(matches(STATIC_VIEWPORT_HEIGHT, fixture), fixture).toEqual([]);
    }
  });

  it('flags bare small text on a form control override', () => {
    expect(BARE_SMALL_TEXT.test('h-9 text-sm')).toBe(true);
    expect(BARE_SMALL_TEXT.test('text-base md:text-sm')).toBe(false);
    expect(BARE_SMALL_TEXT.test('md:text-xs')).toBe(false);
  });
});

describe('Mobile standards', () => {
  it('uses dynamic viewport units instead of vh for full-height layouts', async () => {
    const violations: string[] = [];
    for (const file of [...(await sourceFiles('src/**/*.{ts,tsx}')), ...(await sourceFiles('src/**/*.css'))]) {
      for (const hit of matches(STATIC_VIEWPORT_HEIGHT, readFile(file))) {
        violations.push(`${normalize(file)}: ${hit} (use dvh)`);
      }
    }

    expect(violations).toEqual([]);
  });

  it('keeps form control bases at 16px below md so iOS does not zoom on focus', () => {
    const violations: string[] = [];
    for (const { file, description } of FORM_CONTROL_BASES) {
      const text = readFile(file);
      if (!/(?<![:\w-])text-base(?![\w-])/.test(text) || !text.includes('md:text-sm')) {
        violations.push(`${file}: ${description} needs text-base md:text-sm`);
      }
    }

    expect(violations).toEqual([]);
  });

  it('does not override form control text with a bare small size', async () => {
    const violations: string[] = [];
    for (const file of await sourceFiles('src/**/*.tsx')) {
      for (const tag of matches(FORM_CONTROL_OVERRIDE, readFile(file))) {
        if (BARE_SMALL_TEXT.test(tag)) violations.push(`${normalize(file)}: ${tag.slice(0, 80)}`);
      }
    }

    expect(violations).toEqual([]);
  });
});
