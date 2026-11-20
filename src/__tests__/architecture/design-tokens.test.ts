import { describe, it, expect } from 'vitest';
import { sep } from 'path';
import { scanFiles, readFile } from './helpers/file-scanner';

const PALETTES = [
  'slate', 'gray', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan',
  'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
].join('|');
const UTILITIES = 'bg|text|border|ring|divide|outline|fill|stroke|from|via|to|shadow|decoration|accent|caret|placeholder';
const RAW_PALETTE = new RegExp(String.raw`(?<![\w-])(?:${UTILITIES})-(?:${PALETTES})-\d{2,3}(?![\w-])`, 'g');

const DARK_RAW_PALETTE = new RegExp(String.raw`(?<![\w-])dark:[\w\[\]=:*&>()'.!-]*?(?:${UTILITIES})-(?:${PALETTES})-\d{2,3}(?![\w-])`, 'g');

const ARBITRARY_COLOR = new RegExp(
  String.raw`(?<![\w-])(?:[a-z-]+:)*(?:${UTILITIES})-\[[^\]\s]*(?:#[0-9a-fA-F]{3,8}\b|(?:hsla?|rgba?|oklch|oklab|lab|lch)\(|var\(--color-)`,
  'g'
);

const DARK_WITH_BLACK_OR_WHITE = new RegExp(
  String.raw`(?<![\w-])dark:[\w\[\]=:*&>()'.!-]*?(?:${UTILITIES})-(?:white|black)(?![\w-])`,
  'g'
);

const APPLY_RAW_PALETTE = new RegExp(
  String.raw`@apply[^;}]*?(?<![\w-])(?:[a-z-]+:)*(?:${UTILITIES})-(?:(?:${PALETTES})-\d{2,3}|white|black|\[[^\]\s]*(?:#[0-9a-fA-F]{3,8}\b|(?:hsla?|rgba?)\())(?![\w-])`,
  'g'
);

function normalize(file: string): string {
  return file.split(sep).join('/');
}

const ALLOWED_RAW_PALETTE: Record<string, string> = {};

async function sourceFiles(): Promise<string[]> {
  return scanFiles('src/**/*.{ts,tsx}', { exclude: ['**/__tests__/**'] });
}

function findings(file: string, pattern: RegExp): string[] {
  const text = readFile(file);
  return [...text.matchAll(pattern)].map((match) => `${file}: ${match[0]}`);
}

function matches(pattern: RegExp, text: string): string[] {
  return [...text.matchAll(pattern)].map((match) => match[0]);
}

describe('Design token detectors', () => {
  it('flags arbitrary colour values', () => {
    for (const fixture of [
      'bg-[#ff0000]',
      'text-[hsl(10_20%_30%)]',
      'border-[rgb(1,2,3)]',
      'hover:bg-[var(--color-primary)]',
      'shadow-[0_0_8px_rgba(244,63,94,0.6)]',
      'dark:bg-[#111]',
    ]) {
      expect(matches(ARBITRARY_COLOR, fixture), fixture).not.toEqual([]);
    }
    for (const fixture of ['bg-primary', 'w-[calc(100%-2rem)]', 'text-[length:var(--text-2xs)]', 'before:content-[attr(data-label)]', 'grid-cols-[auto_1fr]']) {
      expect(matches(ARBITRARY_COLOR, fixture), fixture).toEqual([]);
    }
  });

  it('flags dark: combined with white or black', () => {
    for (const fixture of ['dark:text-white', 'dark:hover:text-white', 'dark:bg-black', 'dark:border-white']) {
      expect(matches(DARK_WITH_BLACK_OR_WHITE, fixture), fixture).not.toEqual([]);
    }
    for (const fixture of ['dark:text-foreground', 'text-white', 'dark:bg-input/30', 'dark:hover:text-foreground']) {
      expect(matches(DARK_WITH_BLACK_OR_WHITE, fixture), fixture).toEqual([]);
    }
  });

  it('flags raw palette classes inside css @apply', () => {
    for (const fixture of ['.a { @apply bg-red-500 p-2; }', '.a { @apply text-white; }', '.a { @apply dark:bg-[#111] p-2; }']) {
      expect(matches(APPLY_RAW_PALETTE, fixture), fixture).not.toEqual([]);
    }
    for (const fixture of ['.a { @apply bg-card p-2; }', '.a { @apply text-foreground border-border; }']) {
      expect(matches(APPLY_RAW_PALETTE, fixture), fixture).toEqual([]);
    }
  });
});

describe('Design token discipline', () => {
  it('never pairs dark: with a raw palette colour; dark mode comes from the tokens', async () => {
    const violations = (await sourceFiles()).flatMap((file) => findings(file, DARK_RAW_PALETTE));
    expect(violations).toEqual([]);
  });

  it('never uses arbitrary colour values in class names', async () => {
    const violations = (await sourceFiles()).flatMap((file) => findings(file, ARBITRARY_COLOR));
    expect(violations).toEqual([]);
  });

  it('never pairs dark: with white or black; use a foreground token', async () => {
    const violations = (await sourceFiles()).flatMap((file) => findings(file, DARK_WITH_BLACK_OR_WHITE));
    expect(violations).toEqual([]);
  });

  it('keeps raw palette and arbitrary colours out of css @apply', async () => {
    const stylesheets = await scanFiles('src/**/*.css');
    const violations = stylesheets.flatMap((file) => findings(file, APPLY_RAW_PALETTE));
    expect(violations).toEqual([]);
  });

  it('uses semantic tokens instead of raw palette classes outside the allow-list', async () => {
    const files = (await sourceFiles()).filter((file) => !(normalize(file) in ALLOWED_RAW_PALETTE));
    const violations = files.flatMap((file) => findings(file, RAW_PALETTE));
    expect(violations).toEqual([]);
  });

  it('keeps every allow-list entry justified and still needed', async () => {
    const files = new Set((await sourceFiles()).map((file) => normalize(file)));
    for (const [file, reason] of Object.entries(ALLOWED_RAW_PALETTE)) {
      expect(reason.trim().length, file).toBeGreaterThan(10);
      expect(files.has(file), `${file} no longer exists`).toBe(true);
      expect(findings(file, RAW_PALETTE).length, `${file} no longer needs its entry`).toBeGreaterThan(0);
    }
  });
});
