import { describe, expect, it } from 'vitest';
import { isActiveAccount, isBannedAccount } from './utils';

describe('account status rules', () => {
    it('recognises banned and active accounts', () => {
        expect(isBannedAccount({ status: 'BANNED' })).toBe(true);
        expect(isBannedAccount({ status: 'ACTIVE' })).toBe(false);
        expect(isActiveAccount({ status: 'ACTIVE' })).toBe(true);
        expect(isActiveAccount({ status: 'LOCKED' })).toBe(false);
    });
});
