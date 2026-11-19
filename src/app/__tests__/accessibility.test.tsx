import { describe, it, expect, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { Header } from '@/widgets/header';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => '/',
}));
vi.mock('@/features/auth', async () => {
    const actual = await vi.importActual<typeof import('@/features/auth')>('@/features/auth');
    return {
        ...actual,
        useAuth: () => ({
            user: { id: 1, username: 'alice', email: '', roles: ['USER'] },
            isAuthenticated: true,
            isAdmin: false,
            isLoading: false,
            logout: vi.fn(),
        }),
    };
});

describe('accessibility', () => {
    it('names the account menu trigger', () => {
        render(<Header />);

        expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument();
    });

    it('honours prefers-reduced-motion globally', () => {
        const css = readFileSync('src/app/globals.css', 'utf8');

        expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
        expect(css).toMatch(/animation-duration:\s*0\.01ms/);
    });

    it('has a single main landmark in the root layout only', () => {
        const collect = (dir: string): string[] =>
            readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
                const path = join(dir, entry.name);
                if (entry.isDirectory()) return entry.name === '__tests__' ? [] : collect(path);
                return path.endsWith('.tsx') ? [path] : [];
            });
        const withMain = [...collect('src/app'), ...collect('src/widgets'), ...collect('src/features')]
            .filter((file) => /<main\b/.test(readFileSync(file, 'utf8')))
            .map((file) => file.split(String.fromCharCode(92)).join('/'));

        expect(withMain.sort()).toEqual(['src/app/global-error.tsx', 'src/app/layout.tsx']);
    });
});
