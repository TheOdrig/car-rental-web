import { describe, it, expect } from 'vitest';
import { readdirSync, statSync } from 'fs';
import { scanFiles, hasUseClientDirective } from './helpers/file-scanner';
import { getImports, hasBusinessLogic, hasAPIcalls } from './helpers/import-analyzer';
import { hasComplexJSX, hasInlineClientComponent } from './helpers/ast-parser';



const WIDGETS_WITH_LOGIC = [
  'src/widgets/car-filters/ui/filter-panel.tsx',
  'src/widgets/car-filters/ui/price-range-slider.tsx',
  'src/widgets/car-search/ui/car-search.tsx',
  'src/widgets/header/ui/theme-toggle.tsx',
  'src/widgets/home/ui/search-widget.tsx',
];

const STATIC_PAGES = [
  'src/app/(protected)/settings/payment/page.tsx',
  'src/app/(public)/privacy/page.tsx',
  'src/app/(public)/terms/page.tsx',
  'src/app/forbidden/page.tsx',
];

function normalized(files: string[]): string[] {
  return files.map((file) => file.split(String.fromCharCode(92)).join('/')).sort();
}

describe('Widget & Page Properties', () => {

  it('Property 20: Widget Import Restrictions - widgets import features, entities, shared', async () => {
    const widgets = await scanFiles('src/widgets/**/*.{ts,tsx}');
    const violations: Array<{ file: string; invalidImports: string[] }> = [];

    for (const file of widgets) {
      const imports = getImports(file);
      const invalidImports = imports.filter((imp) => {
        return imp.startsWith('@/app') || imp.includes('/app/');
      });

      if (invalidImports.length > 0) {
        violations.push({ file, invalidImports });
      }
    }

    if (violations.length > 0) {
      console.log('\n❌ Property 20 Violations:');
      violations.forEach(({ file, invalidImports }) => {
        console.log(`  - ${file}:`);
        invalidImports.forEach((imp) => {
          console.log(`    → invalid import: ${imp}`);
        });
      });
    }

    expect(violations).toHaveLength(0);
  });


  it('Property 21: Widget Composition Pattern - compose, dont implement logic', async () => {
    const widgets = await scanFiles('src/widgets/**/*.{ts,tsx}');
    const violations: string[] = [];

    for (const file of widgets) {

      if (file.endsWith('index.ts') || file.endsWith('index.tsx')) {
        continue;
      }

      const hasLogic = hasBusinessLogic(file);
      const hasAPI = hasAPIcalls(file);

      if (hasLogic || hasAPI) {
        violations.push(file);
      }
    }

    if (violations.length > 0) {
      console.log('\n⚠️  Property 21 Violations:');
      violations.forEach((file) => {
        console.log(`  - ${file}: Widget should compose, not implement logic`);
      });
    }


    expect(normalized(violations)).toEqual(WIDGETS_WITH_LOGIC);
  });


  it('Property 22: Page Widget Usage - pages compose widgets/features', async () => {
    const pages = await scanFiles('src/app/**/page.tsx');
    const violations: string[] = [];

    for (const file of pages) {
      const imports = getImports(file);
      const hasWidgetOrFeature = imports.some(
        (imp) => imp.startsWith('@/widgets') || imp.startsWith('@/features')
      );
      const hasInlineUI = hasComplexJSX(file);


      if (hasInlineUI && !hasWidgetOrFeature) {
        violations.push(file);
      }
    }

    if (violations.length > 0) {
      console.log('\n⚠️  Property 22 Violations:');
      violations.forEach((file) => {
        console.log(`  - ${file}: Page should compose widgets/features, not implement UI`);
      });
    }


    expect(normalized(violations)).toEqual(STATIC_PAGES);
  });


  it('Property 23: Feature Unit Test Coverage - isolated feature tests', async () => {
    const features = readdirSync('src/features').filter((name) => statSync(`src/features/${name}`).isDirectory());
    const violations: string[] = [];

    for (const feature of features) {
      const hasTests = readdirSync(`src/features/${feature}`, { recursive: true }).some((entry) =>
        String(entry).includes('.test.')
      );

      if (!hasTests) {
        violations.push(feature);
      }
    }

    if (violations.length > 0) {
      console.log('\n⚠️  Property 23 Violations:');
      violations.forEach((feature) => {
        console.log(`  - ${feature}: Feature should have unit tests`);
      });
    }


    expect(violations).toEqual([]);
  });


  it('Property 24: Page Server Component Default - pages are Server Components', async () => {
    const pages = await scanFiles('src/app/**/page.tsx');
    const violations: string[] = [];

    for (const file of pages) {
      const hasUseClient = hasUseClientDirective(file);


      if (hasUseClient) {

        const imports = getImports(file);
        const requiresClient = imports.some(
          (imp) =>
            imp.includes('useState') ||
            imp.includes('useEffect') ||
            imp.includes('useRouter') ||
            imp.includes('useSearchParams')
        );

        if (!requiresClient) {
          violations.push(file);
        }
      }
    }

    if (violations.length > 0) {
      console.log('\n⚠️  Property 24 Violations:');
      violations.forEach((file) => {
        console.log(`  - ${file}: Page should be Server Component (remove 'use client')`);
      });
    }


    expect(violations).toEqual([]);
  });


  it('Property 25: Client Component Extraction - extract to features, not inline', async () => {
    const pages = await scanFiles('src/app/**/page.tsx');
    const violations: string[] = [];

    for (const file of pages) {
      if (hasInlineClientComponent(file)) {
        violations.push(file);
      }
    }

    if (violations.length > 0) {
      console.log('\n⚠️  Property 25 Violations:');
      violations.forEach((file) => {
        console.log(`  - ${file}: Extract client components to features`);
      });
    }


    expect(violations).toEqual([]);
  });
});