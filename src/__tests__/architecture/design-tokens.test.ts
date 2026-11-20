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

describe('Design token discipline', () => {
  it('never pairs dark: with a raw palette colour; dark mode comes from the tokens', async () => {
    const violations = (await sourceFiles()).flatMap((file) => findings(file, DARK_RAW_PALETTE));
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
