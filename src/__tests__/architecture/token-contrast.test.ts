import { describe, it, expect } from 'vitest';
import { readFile } from './helpers/file-scanner';

const MIN_TEXT_CONTRAST = 4.5;

type Rgb = [number, number, number];

function hslToRgb(h: number, s: number, l: number): Rgb {
  const saturation = s / 100;
  const lightness = l / 100;
  const amount = saturation * Math.min(lightness, 1 - lightness);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    return lightness - amount * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  return [channel(0), channel(8), channel(4)];
}

function luminance([r, g, b]: Rgb): number {
  const linear = (value: number) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

function blockBetween(css: string, start: RegExp): string {
  const begin = css.search(start);
  const open = css.indexOf('{', begin);
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') depth -= 1;
    if (depth === 0) return css.slice(open + 1, index);
  }
  throw new Error(`Unclosed block for ${start}`);
}

function tokens(block: string): Record<string, Rgb> {
  const result: Record<string, Rgb> = {};
  for (const match of block.matchAll(/--([\w-]+):\s*hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)/g)) {
    result[match[1]] = hslToRgb(Number(match[2]), Number(match[3]), Number(match[4]));
  }
  return result;
}

const css = readFile('src/app/globals.css');
const light = tokens(blockBetween(css, /^:root\s*\{/m));
const dark = { ...light, ...tokens(blockBetween(css, /^\s*\.dark\s*\{/m)) };

const SOLID_SURFACES = ['success', 'destructive', 'warning', 'info', 'primary'];

describe('Design token contrast', () => {
  it('computes contrast ratios', () => {
    expect(contrastRatio([0, 0, 0], [1, 1, 1])).toBeCloseTo(21, 0);
    expect(contrastRatio([1, 1, 1], [1, 1, 1])).toBeCloseTo(1, 5);
  });

  for (const [name, palette] of [['light', light], ['dark', dark]] as const) {
    it(`keeps text on solid status surfaces readable in ${name} mode`, () => {
      const failures = SOLID_SURFACES.flatMap((surface) => {
        const ratio = contrastRatio(palette[surface], palette[`${surface}-foreground`]);
        return ratio >= MIN_TEXT_CONTRAST ? [] : [`${surface}: ${ratio.toFixed(2)}`];
      });
      expect(failures).toEqual([]);
    });

    it(`keeps destructive and success text readable on cards in ${name} mode`, () => {
      const failures = ['destructive', 'success']
        .map((token) => [token, contrastRatio(palette[token], palette.card)] as const)
        .filter(([, ratio]) => ratio < MIN_TEXT_CONTRAST)
        .map(([token, ratio]) => `${token}: ${ratio.toFixed(2)}`);
      expect(failures).toEqual([]);
    });
  }
});

const SUBTLE_TONES = ['success', 'warning', 'danger', 'info', 'primary', 'neutral'];

describe('Subtle status token contrast', () => {
  for (const [name, palette] of [['light', light], ['dark', dark]] as const) {
    it(`keeps subtle status text readable in ${name} mode`, () => {
      const failures = SUBTLE_TONES.flatMap((tone) => {
        const ratio = contrastRatio(palette[`${tone}-subtle`], palette[`${tone}-subtle-foreground`]);
        return ratio >= MIN_TEXT_CONTRAST ? [] : [`${tone}: ${ratio.toFixed(2)}`];
      });
      expect(failures).toEqual([]);
    });
  }
});
