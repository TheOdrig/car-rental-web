import { describe, it, expect } from 'vitest';
import { scanFiles, readFile } from './helpers/file-scanner';

const API_LITERAL = /['"\x60]\/api\//g;

function findApiLiterals(source: string): string[] {
  return [...source.matchAll(API_LITERAL)].map((match) => match[0]);
}

describe('Client endpoint literals', () => {
  it('detects BFF path literals', () => {
    const planted = [
      `clientGet('/api/cars')`,
      'clientPost(`/api/rentals/${id}/cancel`)',
      `fetch("/api/auth/refresh")`,
    ];
    for (const source of planted) {
      expect(findApiLiterals(source), source).not.toEqual([]);
    }
  });

  it('ignores the endpoint map, bare prefixes and upstream paths', () => {
    const allowed = [
      `clientGet(ENDPOINTS.cars.list)`,
      `const API_BASE = '/api';`,
      `const V1 = '/v1/cars'`,
      `https://example.com/api/cars`,
    ];
    for (const source of allowed) {
      expect(findApiLiterals(source), source).toEqual([]);
    }
  });

  it('keeps client BFF paths in shared/api/endpoints.ts', async () => {
    const files = await scanFiles('src/**/*.{ts,tsx}', {
      exclude: [
        '**/__tests__/**',
        '**/testing/**',
        'src/shared/api/generated/**',
        'src/shared/api/endpoints.ts',
        'src/app/api/**',
        'src/shared/server/**',
        'src/proxy.ts',
        'src/app/setup-*.ts',
        'src/shared/config/route-access.ts',
      ],
    });
    const violations = files.flatMap((file) =>
      findApiLiterals(readFile(file)).length > 0 ? [file] : [],
    );

    expect(violations).toEqual([]);
  });
});
