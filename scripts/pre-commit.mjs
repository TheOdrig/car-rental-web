#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const LINTABLE = /^(src|scripts|e2e)\/.*\.(ts|tsx|mjs|js)$/;
const SOURCE = /^src\/.*\.(ts|tsx|css)$/;

export function lintableFiles(files) {
  return files.filter((file) => LINTABLE.test(file) && !file.includes('/generated/'));
}

export function touchesSource(files) {
  return files.some((file) => SOURCE.test(file));
}

function stagedFiles() {
  return execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter(Boolean);
}

function step(label, command, args) {
  console.log(`pre-commit: ${label}`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    console.error(`pre-commit: ${label} failed`);
    process.exit(result.status ?? 1);
  }
}

function main() {
  const staged = stagedFiles();
  const lintable = lintableFiles(staged);

  if (lintable.length > 0) {
    step(`lint ${lintable.length} staged file(s)`, 'npx', ['eslint', '--max-warnings', '0', '--no-warn-ignored', ...lintable]);
  }
  step('type-check', 'npm', ['run', 'type-check']);
  if (touchesSource(staged)) {
    step('architecture tests', 'npm', ['run', 'test:architecture']);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
