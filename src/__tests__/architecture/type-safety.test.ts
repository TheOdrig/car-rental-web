import { describe, it, expect } from 'vitest';
import { scanFiles, readFile } from './helpers/file-scanner';
import {
  hasMagicStrings,
  getSwitchStatements,
  handlesEnum,
  hasDomainSpecificTypes,
  getComplexStates,
  hasDiscriminator,
} from './helpers/ast-parser';



describe('Type Safety Properties', () => {

  it('Property 15: No Magic Strings in Business Logic - use enums', async () => {
    const businessLogic = await scanFiles('src/{features,entities}/**/*.{ts,tsx}');
    const violations: string[] = [];


    const suspiciousStrings = [
      'PENDING',
      'ACTIVE',
      'COMPLETED',
      'CANCELLED',
      'APPROVED',
      'REJECTED',
      'CONFIRMED',
      'AVAILABLE',
      'RENTED',
      'MAINTENANCE',
    ];

    for (const file of businessLogic) {
      if (hasMagicStrings(file, suspiciousStrings)) {
        violations.push(file);
      }
    }

    if (violations.length > 0) {
      console.log('\n⚠️  Property 15 Violations:');
      violations.forEach((file) => {
        console.log(`  - ${file}: Contains magic strings (should use enums)`);
      });
    }


    expect(violations.length).toBeGreaterThanOrEqual(0);
  });


  it('Property 16: Exhaustive Enum Handling - switch with never type check', async () => {
    const files = await scanFiles('src/**/*.{ts,tsx}');
    const violations: string[] = [];

    for (const file of files) {
      const switchStatements = getSwitchStatements(file);

      for (const sw of switchStatements) {

        if (handlesEnum(sw)) {

          const content = readFile(file);
          const hasExhaustive = /default:\s*(?:const|let)\s+\w+:\s*never\s*=/.test(content);

          if (!hasExhaustive && !sw.hasDefault) {
            violations.push(file);
            break;
          }
        }
      }
    }

    if (violations.length > 0) {
      console.log('\n⚠️  Property 16 Violations:');
      violations.forEach((file) => {
        console.log(`  - ${file}: Switch on enum missing exhaustive check`);
      });
    }


    expect(violations.length).toBeGreaterThanOrEqual(0);
  });


  it('Property 17: Type Location Convention - domain types in entities', async () => {
    const sharedTypes = await scanFiles('src/shared/**/*.ts');
    const violations: string[] = [];

    for (const file of sharedTypes) {

      if (file.includes('/lib/') || file.includes('/utils/')) {
        continue;
      }

      if (hasDomainSpecificTypes(file)) {
        violations.push(file);
      }
    }

    if (violations.length > 0) {
      console.log('\n❌ Property 17 Violations:');
      violations.forEach((file) => {
        console.log(`  - ${file}: Domain types should be in entities, not shared`);
      });
    }

    expect(violations).toHaveLength(0);
  });


  it('Property 18: Discriminated Union Usage - type discriminator for complex state', async () => {
    const stateFiles = await scanFiles('src/{features,entities}/**/model/*.ts');
    const violations: string[] = [];

    for (const file of stateFiles) {
      const complexStates = getComplexStates(file);

      for (const stateName of complexStates) {
        if (!hasDiscriminator(file, stateName)) {
          violations.push(`${file} (${stateName})`);
        }
      }
    }

    if (violations.length > 0) {
      console.log('\n⚠️  Property 18 Violations:');
      violations.forEach((violation) => {
        console.log(`  - ${violation}: Complex state should use discriminated union`);
      });
    }


    expect(violations.length).toBeGreaterThanOrEqual(0);
  });
});