#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { isForbiddenPath } from './ai-file-patterns.mjs';

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  .split('\0')
  .filter(Boolean);

const hits = files.filter(isForbiddenPath);

if (hits.length > 0) {
  console.error('check-no-ai-files: forbidden paths are tracked by git:');
  for (const h of hits) console.error(`  ${h}`);
  console.error('Specs and AI-tooling files must stay local (see .git/info/exclude). Remove with: git rm -r --cached <path>');
  process.exit(1);
}
console.log(`check-no-ai-files: OK (${files.length} tracked files checked)`);
