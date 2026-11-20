import { describe, it, expect } from 'vitest';
import { dirname, posix, relative, resolve } from 'path';
import { scanFiles } from './helpers/file-scanner';
import { getImports } from './helpers/import-analyzer';

const LAYERS = ['shared', 'entities', 'features', 'widgets', 'app'] as const;
type Layer = (typeof LAYERS)[number];

interface Location {
  layer: Layer;
  slice: string | null;
  rest: string;
}

const SRC_ROOT = resolve(process.cwd(), 'src');

function toPosix(path: string): string {
  return path.split(String.fromCharCode(92)).join('/');
}

function locate(srcRelativePath: string): Location | null {
  const parts = toPosix(srcRelativePath).split('/').filter(Boolean);
  const layer = parts[0] as Layer;

  if (!LAYERS.includes(layer)) {
    return null;
  }

  if (layer === 'shared' || layer === 'app') {
    return { layer, slice: null, rest: parts.slice(1).join('/') };
  }

  return { layer, slice: parts[1] ?? null, rest: parts.slice(2).join('/') };
}

function locateFile(file: string): Location | null {
  return locate(relative(SRC_ROOT, resolve(file)));
}

function locateImport(importPath: string, fromFile: string): Location | null {
  if (importPath.startsWith('@/')) {
    return locate(importPath.slice(2));
  }

  if (importPath.startsWith('.')) {
    return locate(relative(SRC_ROOT, resolve(dirname(resolve(fromFile)), importPath)));
  }

  return null;
}

function isTestSupport(file: string): boolean {
  const path = toPosix(file);
  return (
    path.includes('/__tests__/') ||
    path.includes('/testing/') ||
    path.includes('/generated/') ||
    /\/app\/setup-[a-z-]+\.ts$/.test(path)
  );
}

async function sourceFiles(): Promise<string[]> {
  const files = await scanFiles('src/**/*.{ts,tsx}');
  return files.filter((file) => !isTestSupport(file));
}

const SELF_BARREL_ALLOWLIST: string[] = [
  'src/entities/car/lib/use-cars.ts',
  'src/entities/car/ui/car-card.tsx',
  'src/entities/car/ui/car-detail.tsx',
  'src/entities/car/ui/car-grid.tsx',
  'src/entities/car/ui/car-list-view.tsx',
  'src/entities/car/ui/similar-car-card.tsx',
  'src/entities/car/ui/similar-cars-section.tsx',
  'src/entities/currency/ui/currency-provider.tsx',
  'src/entities/damage/lib/use-damages.ts',
  'src/entities/rental/lib/use-rentals.ts',
  'src/features/admin/lib/use-admin-dashboard.ts',
  'src/features/admin/ui/alerts-panel.tsx',
  'src/features/admin/ui/penalty-history-section.tsx',
  'src/features/admin/ui/penalty-waive-dialog.tsx',
  'src/features/admin/ui/quick-actions.tsx',
  'src/features/admin/ui/revenue-chart.tsx',
  'src/features/auth/lib/use-password-reset.ts',
  'src/features/auth/lib/use-password.ts',
  'src/features/auth/ui/forgot-password-form.tsx',
  'src/features/auth/ui/reset-password-form.tsx',
  'src/features/book-car/ui/checkout/booking-summary.tsx',
  'src/features/manage-damages/ui/damage-dispute-form.tsx',
  'src/features/user-settings/ui/personal-details-form.tsx',
  'src/features/user-settings/ui/profile-picture.tsx',
  'src/widgets/car-filters/ui/filter-chips.tsx',
  'src/widgets/car-filters/ui/filter-panel.tsx',
  'src/widgets/car-filters/ui/filter-sidebar.tsx',
  'src/widgets/car-filters/ui/sort-dropdown.tsx',
];

describe('FSD boundaries', () => {
  it('imports only flow to lower layers', async () => {
    const violations: string[] = [];

    for (const file of await sourceFiles()) {
      const from = locateFile(file);
      if (!from) continue;

      for (const importPath of getImports(file)) {
        const target = locateImport(importPath, file);
        if (target && LAYERS.indexOf(target.layer) > LAYERS.indexOf(from.layer)) {
          violations.push(`${toPosix(file)} (${from.layer}) imports ${importPath} (${target.layer})`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('features and widgets never import a sibling slice of the same layer', async () => {
    const violations: string[] = [];

    for (const file of await sourceFiles()) {
      const from = locateFile(file);
      if (!from || (from.layer !== 'features' && from.layer !== 'widgets')) continue;

      for (const importPath of getImports(file)) {
        const target = locateImport(importPath, file);
        if (target && target.layer === from.layer && target.slice !== from.slice) {
          violations.push(`${toPosix(file)} imports ${importPath}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('entities reach a sibling entity only through its @x entry point', async () => {
    const violations: string[] = [];

    for (const file of await sourceFiles()) {
      const from = locateFile(file);
      if (!from || from.layer !== 'entities') continue;

      for (const importPath of getImports(file)) {
        const target = locateImport(importPath, file);
        if (target && target.layer === 'entities' && target.slice !== from.slice) {
          if (!target.rest.startsWith('@x/')) {
            violations.push(`${toPosix(file)} imports ${importPath}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('slices do not import their own public API barrel except for the known offenders', async () => {
    const offenders = new Set<string>();

    for (const file of await sourceFiles()) {
      const from = locateFile(file);
      if (!from || !from.slice) continue;
      if (posix.basename(toPosix(file)).startsWith('index.')) continue;

      for (const importPath of getImports(file)) {
        const target = locateImport(importPath, file);
        if (target && target.layer === from.layer && target.slice === from.slice && target.rest === '') {
          offenders.add(toPosix(relative(process.cwd(), resolve(file))));
        }
      }
    }

    expect([...offenders].sort()).toEqual(SELF_BARREL_ALLOWLIST);
  });
});

describe('Import scanner', () => {
  it('sees imports, re-exports and multi-line statements', async () => {
    const { writeFileSync, mkdtempSync, rmSync } = await import('fs');
    const { tmpdir } = await import('os');
    const { join } = await import('path');
    const directory = mkdtempSync(join(tmpdir(), 'scan-'));
    const file = join(directory, 'sample.ts');

    writeFileSync(
      file,
      [
        "import { a } from '@/features/one';",
        'import {',
        '  b,',
        '  type C,',
        "} from '@/entities/two';",
        "export { d } from '@/widgets/three';",
        "export * from '@/shared/four';",
        "import '@/shared/five';",
        "const lazy = () => import('@/features/six');",
      ].join('\n')
    );

    try {
      expect(getImports(file).sort()).toEqual(
        ['@/entities/two', '@/features/one', '@/features/six', '@/shared/five', '@/shared/four', '@/widgets/three'].sort()
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
