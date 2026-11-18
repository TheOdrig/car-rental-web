import { describe, it, expect } from 'vitest';
import { scanFiles, readFile } from './helpers/file-scanner';
import { getExports } from './helpers/import-analyzer';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function directories(path: string): string[] {
  return readdirSync(path).filter((item) => statSync(join(path, item)).isDirectory());
}

function hasFiles(path: string): boolean {
  return readdirSync(path, { recursive: true }).some((entry) => statSync(join(path, String(entry))).isFile());
}

describe('Slice structure properties', () => {
  const layers = ['features', 'entities', 'widgets'];

  it('every slice has an index.ts and at least one standard segment', () => {
    const violations: string[] = [];

    for (const layer of layers) {
      for (const slice of directories(`src/${layer}`)) {
        const slicePath = `src/${layer}/${slice}`;
        if (!hasFiles(slicePath)) {
          continue;
        }

        if (!existsSync(`${slicePath}/index.ts`)) {
          violations.push(`${slicePath}: missing index.ts`);
        }

        const segments = ['api', 'model', 'ui', 'lib'].filter((segment) => existsSync(`${slicePath}/${segment}`));
        if (segments.length === 0) {
          violations.push(`${slicePath}: none of api, model, ui, lib`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('every public API exports something', async () => {
    const publicApis = await scanFiles('src/{features,entities,widgets}/*/index.ts');
    const violations = publicApis.filter((api) => getExports(api).length === 0);

    expect(publicApis.length).toBeGreaterThan(0);
    expect(violations).toEqual([]);
  });

  it('query keys come from the slice key factories, not inline literals', async () => {
    const files = await scanFiles('src/**/*.{ts,tsx}', { exclude: ['**/__tests__/**', '**/testing/**'] });
    const literal = /queryKey: *[[] *['"]/;
    const violations = files.filter((file) => literal.test(readFile(file)));

    expect(violations).toEqual([]);
  });

});
