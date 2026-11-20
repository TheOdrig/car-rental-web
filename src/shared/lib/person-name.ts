export interface PersonNameParts {
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    email?: string | null;
}

function clean(value: string | null | undefined): string {
    const text = (value ?? '').trim();
    return text === 'null' || text === 'undefined' ? '' : text;
}

export function personFullName(person: PersonNameParts | null | undefined): string {
    if (!person) return '';
    return [clean(person.firstName), clean(person.lastName)].filter(Boolean).join(' ');
}

export function personDisplayName(person: PersonNameParts | null | undefined, fallback = 'Unknown user'): string {
    if (!person) return fallback;
    return personFullName(person) || clean(person.username) || clean(person.email) || fallback;
}

export function personInitials(person: PersonNameParts | null | undefined): string {
    if (!person) return '?';
    const first = clean(person.firstName);
    const last = clean(person.lastName);
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    const source = first || last || clean(person.username) || clean(person.email);
    return source ? source.slice(0, 2).toUpperCase() : '?';
}
