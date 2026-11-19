import { describe, expect, it } from 'vitest';
import spec from '../../../../contract/openapi.json';
import { DAMAGE_CATEGORIES, DAMAGE_SEVERITIES, DAMAGE_STATUSES } from '@/entities/damage';
import { LATE_RETURN_STATUSES, RentalStatus } from '@/entities/rental';
import { pickCode } from '@/shared/lib';

interface Parameter {
    name: string;
    schema?: { enum?: string[]; items?: { enum?: string[] } };
}

const paths = (spec as unknown as { paths: Record<string, Record<string, { parameters?: Parameter[] }>> }).paths;

function paramCodes(path: string, name: string): string[] {
    const operation = paths[path].get;
    const parameter = operation?.parameters?.find((candidate) => candidate.name === name);
    return parameter?.schema?.enum ?? parameter?.schema?.items?.enum ?? [];
}

describe('enum query parameters are sent as the exact contract codes', () => {
    it.each([
        ['/api/v1/admin/damages/search', 'severity', DAMAGE_SEVERITIES],
        ['/api/v1/admin/damages/search', 'category', DAMAGE_CATEGORIES],
        ['/api/v1/admin/damages/search', 'status', DAMAGE_STATUSES],
        ['/api/v1/admin/late-returns', 'status', LATE_RETURN_STATUSES],
        ['/api/v1/admin/users/{id}/rentals', 'status', Object.values(RentalStatus)],
        ['/api/v1/rentals/admin', 'status', Object.values(RentalStatus)],
    ])('%s %s', (path, name, webCodes) => {
        const contractCodes = paramCodes(path, name);

        expect(contractCodes.length).toBeGreaterThan(1);
        expect([...webCodes].sort()).toEqual([...contractCodes].sort());
    });

    it('drops a label or a lower-case value instead of forwarding it', () => {
        expect(pickCode('MINOR', DAMAGE_SEVERITIES)).toBe('MINOR');
        expect(pickCode('Minor', DAMAGE_SEVERITIES)).toBeUndefined();
        expect(pickCode('minor', DAMAGE_SEVERITIES)).toBeUndefined();
        expect(pickCode('Under Assessment', DAMAGE_STATUSES)).toBeUndefined();
        expect(pickCode(null, DAMAGE_STATUSES)).toBeUndefined();
    });
});
