import { describe, it, expect } from 'vitest';
import { scanFiles, readFile } from './helpers/file-scanner';

const EXEMPT_PREFIXES = ['api', 'images', 'icon'];

const PATH_START = String.raw`['"\x60]\/(?!\/)(?!(?:${EXEMPT_PREFIXES.join('|')})(?:[/?.'"\x60]))`;

const POSITIONS = [
  String.raw`\b(?:href|backHref|backUrl|viewAllHref|viewAllLink)\s*[=:]\s*\{?\s*${PATH_START}`,
  String.raw`\b(?:push|replace|redirect|permanentRedirect)\(\s*${PATH_START}`,
  String.raw`\bnew URL\(\s*${PATH_START}`,
  String.raw`\bpath:\s*${PATH_START}`,
];

function findInternalPathLiterals(source: string): string[] {
  const hits: string[] = [];
  for (const position of POSITIONS) {
    for (const match of source.matchAll(new RegExp(position, 'g'))) {
      hits.push(match[0]);
    }
  }
  return hits;
}

describe('Route literals', () => {
  it('detects internal path literals in navigation positions', () => {
    const planted = [
      `<Link href="/admin/users">`,
      `<Link href={'/cars'}>`,
      'router.push(`/rentals/${id}`)',
      `router.replace('/login')`,
      `redirect('/forbidden')`,
      `new URL('/login', request.url)`,
      `{ label: 'Home', href: '/' }`,
    ];
    for (const source of planted) {
      expect(findInternalPathLiterals(source), source).not.toEqual([]);
    }
  });

  it('ignores routes map usage, external urls and BFF or asset paths', () => {
    const allowed = [
      `<Link href={ROUTES.admin.users}>`,
      `router.push(ROUTES.rentals.detail(id))`,
      `<a href="https://example.com/admin">`,
      `fetch('/api/cars')`,
      `href: '/api/files/1'`,
      `<link rel="icon" href="/icon.svg" />`,
      `src="/images/logo.svg"`,
    ];
    for (const source of allowed) {
      expect(findInternalPathLiterals(source), source).toEqual([]);
    }
  });

  it('keeps hand-written internal paths out of src, use ROUTES from shared/config/routes', async () => {
    const files = await scanFiles('src/**/*.{ts,tsx}', {
      exclude: ['**/__tests__/**', '**/testing/**', 'src/shared/config/routes.ts', 'src/shared/server/auth-cookies.ts', 'src/shared/api/generated/**'],
    });
    const violations = files.flatMap((file) =>
      findInternalPathLiterals(readFile(file)).map((hit) => `${file}: ${hit}`),
    );

    expect(violations).toEqual([]);
  });
});
