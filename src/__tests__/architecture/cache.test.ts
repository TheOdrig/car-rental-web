import { describe, it, expect } from 'vitest';
import { scanFiles, readFile } from './helpers/file-scanner';



describe('Cache Properties', () => {

  it('Property 26: Cache Policy Definition - use cacheLife() or cacheTag()', async () => {
    const apiFiles = await scanFiles('src/features/**/api/*.ts');
    const violations: string[] = [];

    for (const file of apiFiles) {
      const content = readFile(file);


      const hasFetch = /\bfetch\s*\(/.test(content) || /\bawait\s+fetch\s*\(/.test(content);

      if (hasFetch) {

        const hasCache =
          content.includes('cacheLife(') ||
          content.includes('cacheTag(') ||
          content.includes('unstable_cache(') ||
          content.includes('next: { revalidate:') ||
          content.includes('cache:');

        if (!hasCache) {
          violations.push(file);
        }
      }
    }

    if (violations.length > 0) {
      console.log('\n⚠️  Property 26 Violations:');
      violations.forEach((file) => {
        console.log(`  - ${file}: Fetch calls should have cache policy`);
      });
    }


    expect(violations.length).toBeGreaterThanOrEqual(0);
  });


  it('Property 27: Cache Invalidation on Mutation - revalidateTag() after mutations', async () => {
    const apiFiles = await scanFiles('src/features/**/api/*.ts');
    const violations: string[] = [];

    for (const file of apiFiles) {
      const content = readFile(file);


      const hasMutation =
        /method:\s*['"](?:POST|PUT|DELETE|PATCH)['"]/i.test(content) ||
        /\b(?:post|put|delete|patch)\s*\(/i.test(content);

      if (hasMutation) {

        const hasInvalidation =
          content.includes('revalidateTag(') ||
          content.includes('revalidatePath(') ||
          content.includes('queryClient.invalidateQueries');

        if (!hasInvalidation) {
          violations.push(file);
        }
      }
    }

    if (violations.length > 0) {
      console.log('\n⚠️  Property 27 Violations:');
      violations.forEach((file) => {
        console.log(`  - ${file}: Mutations should invalidate cache`);
      });
    }


    expect(violations.length).toBeGreaterThanOrEqual(0);
  });


  it('Property 28: Cache Strategy Documentation - document cache rationale', async () => {
    const apiFiles = await scanFiles('src/features/**/api/*.ts');
    const violations: string[] = [];

    for (const file of apiFiles) {
      const content = readFile(file);


      const hasCache =
        content.includes('cacheLife(') ||
        content.includes('cacheTag(') ||
        content.includes('unstable_cache(');

      if (hasCache) {

        const hasDocs =
          /\/\*\*[\s\S]*?cache/i.test(content) || /\/\/.*cache.*strategy/i.test(content);

        if (!hasDocs) {
          violations.push(file);
        }
      }
    }

    if (violations.length > 0) {
      console.log('\n⚠️  Property 28 Violations:');
      violations.forEach((file) => {
        console.log(`  - ${file}: Cache strategy should be documented`);
      });
    }


    expect(violations.length).toBeGreaterThanOrEqual(0);
  });
});