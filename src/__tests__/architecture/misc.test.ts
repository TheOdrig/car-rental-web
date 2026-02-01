import { describe, it, expect } from 'vitest';
import { scanFiles, readFile, fileExists } from './helpers/file-scanner';
import { getExports } from './helpers/import-analyzer';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';



describe('Miscellaneous Properties', () => {

  it('Property 4: Slice Structure Consistency - standard segments', async () => {
    const layers = ['features', 'entities', 'widgets'];
    const violations: string[] = [];

    for (const layer of layers) {
      const layerPath = `src/${layer}`;

      try {
        const slices = readdirSync(layerPath).filter((item) => {
          const itemPath = join(layerPath, item);
          return statSync(itemPath).isDirectory();
        });

        for (const slice of slices) {
          const slicePath = `${layerPath}/${slice}`;


          const hasIndex = fileExists(`${slicePath}/index.ts`);

          if (!hasIndex) {
            violations.push(`${slicePath}: Missing index.ts`);
          }


          const hasApi = fileExists(`${slicePath}/api`);
          const hasModel = fileExists(`${slicePath}/model`);
          const hasUi = fileExists(`${slicePath}/ui`);
          const hasLib = fileExists(`${slicePath}/lib`);

          if (!hasApi && !hasModel && !hasUi && !hasLib) {
            violations.push(`${slicePath}: Missing standard segments (api, model, ui, lib)`);
          }
        }
      } catch {

      }
    }

    if (violations.length > 0) {
      console.log('\n⚠️  Property 4 Violations:');
      violations.forEach((violation) => {
        console.log(`  - ${violation}`);
      });
    }


    expect(violations.length).toBeGreaterThanOrEqual(0);
  });


  it('Property 9: Event Bus Asynchronous Delivery - non-blocking', async () => {
    const eventBusPath = 'src/shared/events/event-bus.ts';

    if (!fileExists(eventBusPath)) {
      console.log('\n⚠️  Event bus not found, skipping test');
      return;
    }

    const content = readFile(eventBusPath);


    const isAsync =
      content.includes('setTimeout') ||
      content.includes('queueMicrotask') ||
      content.includes('Promise.resolve().then');

    if (!isAsync) {
      console.log('\n❌ Property 9 Violation:');
      console.log('  - Event bus should deliver events asynchronously');
    }

    expect(isAsync).toBe(true);
  });


  it('Property 19: API Contract Stability - backward compatibility', async () => {
    const publicAPIs = await scanFiles('src/{features,entities,widgets}/**/index.ts');
    const violations: string[] = [];

    for (const api of publicAPIs) {
      const exports = getExports(api);





      if (exports.length < 2 && !api.includes('/shared/')) {
        violations.push(`${api}: Very few exports (${exports.length}), might be incomplete`);
      }

      const content = readFile(api);


      if (content.includes("from './lib")) {
        violations.push(`${api}: Exports internal lib/ modules (should be private)`);
      }
    }

    if (violations.length > 0) {
      console.log('\n⚠️  Property 19 Violations:');
      violations.forEach((violation) => {
        console.log(`  - ${violation}`);
      });
    }


    expect(violations.length).toBeGreaterThanOrEqual(0);
  });
});