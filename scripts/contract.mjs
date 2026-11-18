import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const snapshot = join(root, 'contract', 'openapi.json');
const generated = join(root, 'src', 'shared', 'api', 'generated', 'openapi.ts');
const apiSpec = resolve(root, '..', 'car-rental-api', 'openapi', 'openapi.json');
const bin = join(root, 'node_modules', 'openapi-typescript', 'bin', 'cli.js');

function normalize(text) {
    return text.replace(/\r\n/g, '\n');
}

function generate(output) {
    const result = spawnSync(process.execPath, [bin, snapshot, '-o', output], { cwd: root, stdio: 'pipe' });
    if (result.status !== 0) {
        process.stderr.write(result.stderr);
        process.stderr.write(result.stdout);
        throw new Error('openapi-typescript failed');
    }
}

function sync() {
    if (existsSync(apiSpec)) {
        copyFileSync(apiSpec, snapshot);
        console.log(`contract: snapshot updated from ${apiSpec}`);
    } else {
        console.log('contract: ../car-rental-api spec not found, keeping the committed snapshot');
    }
    generate(generated);
    console.log('contract: generated types written');
}

function check() {
    const dir = mkdtempSync(join(tmpdir(), 'contract-'));
    try {
        const fresh = join(dir, 'openapi.ts');
        generate(fresh);
        const matches = existsSync(generated) && normalize(readFileSync(fresh, 'utf8')) === normalize(readFileSync(generated, 'utf8'));
        if (!matches) {
            console.error('contract: generated types are out of date with contract/openapi.json; run `npm run contract:sync`');
            process.exitCode = 1;
            return;
        }
        if (existsSync(apiSpec) && normalize(readFileSync(apiSpec, 'utf8')) !== normalize(readFileSync(snapshot, 'utf8'))) {
            console.warn('contract: warning, contract/openapi.json differs from ../car-rental-api/openapi/openapi.json; run `npm run contract:sync` to adopt it');
        }
        console.log('contract: generated types match the snapshot');
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
}

const command = process.argv[2];
if (command === 'sync') sync();
else if (command === 'generate') generate(generated);
else if (command === 'check') check();
else {
    console.error('usage: node scripts/contract.mjs <sync|generate|check>');
    process.exitCode = 2;
}
