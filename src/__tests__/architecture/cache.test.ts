import { describe, it, expect } from 'vitest';
import { scanFiles, readFile } from './helpers/file-scanner';

describe('Cache properties', () => {
  it('feature api modules that call fetch declare a cache policy', async () => {
    const apiFiles = await scanFiles('src/features/**/api/*.ts');
    const violations: string[] = [];

    for (const file of apiFiles) {
      const content = readFile(file);
      const callsFetch = /\bfetch\s*\(/.test(content);
      const hasPolicy =
        content.includes('cacheLife(') ||
        content.includes('cacheTag(') ||
        content.includes('unstable_cache(') ||
        content.includes('next: { revalidate:') ||
        content.includes('cache:');

      if (callsFetch && !hasPolicy) {
        violations.push(file);
      }
    }

    expect(violations).toEqual([]);
  });

  it('feature api modules that mutate invalidate the query cache', async () => {
    const apiFiles = await scanFiles('src/features/**/api/*.ts');
    const violations: string[] = [];

    for (const file of apiFiles) {
      const content = readFile(file);
      const mutates =
        /method:\s*['"](?:POST|PUT|DELETE|PATCH)['"]/i.test(content) ||
        /\b(?:post|put|delete|patch)\s*\(/i.test(content);
      const invalidates =
        content.includes('revalidateTag(') ||
        content.includes('revalidatePath(') ||
        content.includes('queryClient.invalidateQueries');

      if (mutates && !invalidates) {
        violations.push(file);
      }
    }

    expect(violations).toEqual([]);
  });
});
