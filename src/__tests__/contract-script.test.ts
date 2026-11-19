import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function check(spec: string | undefined) {
    return spawnSync(process.execPath, ['scripts/contract.mjs', 'check'], {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: { ...process.env, CAR_RENTAL_API_SPEC: spec ?? join(tmpdir(), 'no-such-car-rental-spec.json') },
    });
}

describe('contract check script', () => {
    it('passes without a skip notice when the sibling spec equals the snapshot', () => {
        const dir = mkdtempSync(join(tmpdir(), 'contract-test-'));
        try {
            const copy = join(dir, 'openapi.json');
            writeFileSync(copy, readFileSync('contract/openapi.json'));

            const result = check(copy);

            expect(result.status).toBe(0);
            expect(result.stdout).toContain('generated types match the snapshot');
            expect(result.stdout).not.toContain('SKIPPED');
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    it('fails when the sibling spec differs from the snapshot', () => {
        const dir = mkdtempSync(join(tmpdir(), 'contract-test-'));
        try {
            const changed = join(dir, 'openapi.json');
            writeFileSync(changed, `${readFileSync('contract/openapi.json', 'utf8')}\n `);

            const result = check(changed);

            expect(result.status).toBe(1);
            expect(result.stderr).toContain('differs from');
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    it('prints an explicit SKIPPED line when the sibling spec is missing', () => {
        const result = check(undefined);

        expect(result.status).toBe(0);
        expect(result.stdout).toContain('SKIPPED comparison');
    });
});
