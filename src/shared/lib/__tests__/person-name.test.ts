import { describe, expect, it } from 'vitest';
import { personDisplayName, personFullName, personInitials } from '../person-name';

describe('personDisplayName', () => {
    it('joins trimmed first and last name', () => {
        expect(personDisplayName({ firstName: ' Ada ', lastName: 'Lovelace ' })).toBe('Ada Lovelace');
    });

    it('uses a single name part when the other is missing', () => {
        expect(personDisplayName({ firstName: 'Ada', lastName: null })).toBe('Ada');
        expect(personDisplayName({ firstName: undefined, lastName: 'Lovelace' })).toBe('Lovelace');
    });

    it('falls back to the username and then the email', () => {
        expect(personDisplayName({ username: 'q12c0442', email: 'a@b.c' })).toBe('q12c0442');
        expect(personDisplayName({ firstName: '', lastName: ' ', email: 'a@b.c' })).toBe('a@b.c');
    });

    it('never renders null or undefined text', () => {
        expect(personDisplayName({ firstName: 'null', lastName: 'undefined', username: 'x' })).toBe('x');
    });

    it('uses the fallback when nothing is known', () => {
        expect(personDisplayName({})).toBe('Unknown user');
        expect(personDisplayName(null, 'Guest')).toBe('Guest');
    });
});

describe('personFullName', () => {
    it('is empty without a real name', () => {
        expect(personFullName({ username: 'x' })).toBe('');
    });
});

describe('personInitials', () => {
    it('uses both initials when both names exist', () => {
        expect(personInitials({ firstName: 'ada', lastName: 'lovelace' })).toBe('AL');
    });

    it('falls back to username or email letters', () => {
        expect(personInitials({ username: 'q12c0442' })).toBe('Q1');
        expect(personInitials({ email: 'zed@x.y' })).toBe('ZE');
        expect(personInitials({})).toBe('?');
    });
});
