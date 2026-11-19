import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import robots from '../robots';
import SettingsError from '../(protected)/settings/error';
import AdminRentalError from '../(admin)/admin/rentals/[id]/error';
import AdminUserError from '../(admin)/admin/users/[id]/error';
import AdminVehicleError from '../(admin)/admin/fleet/[id]/error';
import AdminDamageError from '../(admin)/admin/damages/[id]/error';
import GlobalError from '../global-error';

describe('error boundaries', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each([
        ['settings', SettingsError, '/rentals'],
        ['admin rental', AdminRentalError, '/admin/rentals'],
        ['admin user', AdminUserError, '/admin/users'],
        ['admin vehicle', AdminVehicleError, '/admin/fleet'],
        ['admin damage', AdminDamageError, '/admin/damages'],
    ])('%s segment offers a retry and a way back', async (_name, Boundary, backHref) => {
        const reset = vi.fn();
        render(<Boundary error={Object.assign(new Error('boom'), { digest: 'abc123' })} reset={reset} />);

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Error ID: abc123')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', backHref);

        await userEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(reset).toHaveBeenCalledTimes(1);
    });

    it('the global error boundary renders its own document and can retry', async () => {
        const reset = vi.fn();
        const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        render(<GlobalError error={new Error('fatal')} reset={reset} />, {
            container: document.documentElement,
        });

        expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
        await userEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(reset).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });
});

describe('robots', () => {
    it('keeps admin, account and API paths out of search engines', () => {
        const result = robots();
        const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
        const disallow = rules.flatMap((rule) => rule.disallow ?? []);

        expect(disallow).toEqual(expect.arrayContaining(['/admin', '/api', '/rentals', '/damages', '/settings', '/checkout']));
        expect(rules[0].allow).toBe('/');
    });
});

describe('noindex metadata', () => {
    it.each([
        'src/app/(admin)/layout.tsx',
        'src/app/(protected)/layout.tsx',
        'src/app/(auth)/layout.tsx',
        'src/app/(public)/checkout/page.tsx',
        'src/app/(public)/booking/success/page.tsx',
        'src/app/(public)/booking/failure/page.tsx',
    ])('%s opts out of indexing', async (file) => {
        const { readFileSync } = await import('node:fs');
        const source = readFileSync(file, 'utf8');

        expect(source).toMatch(/robots:\s*\{\s*index:\s*false/);
    });
});
