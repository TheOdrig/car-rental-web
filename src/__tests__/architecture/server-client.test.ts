import { describe, it, expect } from 'vitest';
import {
  scanFiles,
  hasUseClientDirective,
  usesClientFeatures,
  isAsyncComponent,
  hasFetchCalls,
} from './helpers/file-scanner';
import { getImports, resolveImport } from './helpers/import-analyzer';



describe('Server/Client Component Properties', () => {

  it('Property 11: Client Component Directive - use client for interactivity', async () => {
    const components = await scanFiles('src/**/*.tsx');
    const violations: string[] = [];

    for (const file of components) {

      if (file.includes('.test.') || file.includes('setup-tests')) {
        continue;
      }

      const hasUseClient = hasUseClientDirective(file);
      const usesClient = usesClientFeatures(file);


      if (!hasUseClient && usesClient) {
        violations.push(file);
      }
    }

    if (violations.length > 0) {
      console.log('\n❌ Property 11 Violations:');
      violations.forEach((file) => {
        console.log(`  - ${file}: Uses client features but missing 'use client'`);
      });
    }

    expect(violations).toHaveLength(0);
  });


  it('Property 13: Server Component Async Data Fetching - async/await pattern', async () => {
    const serverComponents = await scanFiles('src/app/**/page.tsx');
    const violations: string[] = [];

    for (const file of serverComponents) {

      if (hasUseClientDirective(file)) {
        continue;
      }

      const fetchesData = hasFetchCalls(file);
      const isAsync = isAsyncComponent(file);


      if (fetchesData && !isAsync) {
        violations.push(file);
      }
    }

    if (violations.length > 0) {
      console.log('\n❌ Property 13 Violations:');
      violations.forEach((file) => {
        console.log(`  - ${file}: Fetches data but is not async`);
      });
    }

    expect(violations).toHaveLength(0);
  });


  it('Property 14: Server Component Import Restriction - Client cant import Server', async () => {
    const clientComponents = await scanFiles('src/**/*.tsx', { hasUseClient: true });
    const violations: Array<{ file: string; serverImports: string[] }> = [];

    for (const file of clientComponents) {
      const imports = getImports(file);


      const serverImports: string[] = [];
      for (const imp of imports) {

        if (!imp.startsWith('@/') && !imp.startsWith('.')) {
          continue;
        }


        if (imp.includes('/types') || imp.includes('/lib/') || imp.includes('/model/')) {
          continue;
        }


        const resolvedPath = resolveImport(imp, file);
        if (!resolvedPath) {
          continue;
        }



        const importedFilePath = resolvedPath + '.tsx';
        try {
          const importedHasUseClient = hasUseClientDirective(importedFilePath);
          if (!importedHasUseClient) {
            serverImports.push(imp);
          }
        } catch {

          continue;
        }
      }

      if (serverImports.length > 0) {
        violations.push({ file, serverImports });
      }
    }

    if (violations.length > 0) {
      console.log('\n❌ Property 14 Violations:');
      violations.forEach(({ file, serverImports }) => {
        console.log(`  - ${file}:`);
        serverImports.forEach((imp) => {
          console.log(`    → imports Server component: ${imp}`);
        });
      });
    }

    expect(violations).toHaveLength(0);
  });
});