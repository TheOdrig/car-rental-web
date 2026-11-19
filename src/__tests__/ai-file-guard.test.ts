import { describe, it, expect } from 'vitest';
import { isForbiddenPath } from '../../scripts/ai-file-patterns.mjs';

describe('AI-file guard patterns', () => {
    it.each([
        'AGENTS.md',
        'apps/web/AGENTS.md',
        'CLAUDE.md',
        'nested/deep/CLAUDE.md',
        'GEMINI.md',
        'packages/ui/GEMINI.md',
        '.cursor/rules/style.mdc',
        'packages/ui/.cursor/rules/style.mdc',
        '.windsurf/rules.md',
        '.aider.conf.yml',
        '.aider.chat.history.md',
        '.aider.tags.cache.v3/cache.db',
        '.github/copilot-instructions.md',
        '.kiro/steering/a.md',
        'sub/.agents/skills/x.md',
        'docs/index.md',
        'src/docs/notes.md',
        'specs/plan.md',
        'Claude.md',
        '.Cursor/rules/a.mdc',
        'CHANGELOG.md',
        'CONTRIBUTING.md',
        '.cursorrules',
        '.windsurfrules',
        'kiro.steering/product.md',
        'image.png:Zone.Identifier',
    ])('blocks %s', (path) => {
        expect(isForbiddenPath(path)).toBe(true);
    });

    it.each([
        'README.md',
        'LICENSE',
        'docs-public/screenshots/home.png',
        'src/app/page.tsx',
        '.github/workflows_disabled/README.md',
        'scripts/verify.sh',
        'mydocs/readme.md',
        'src/shared/ui/aider.tsx',
        'notes/GEMINI.md.txt',
    ])('allows %s', (path) => {
        expect(isForbiddenPath(path)).toBe(false);
    });

    it('treats Windows separators like slashes', () => {
        expect(isForbiddenPath(['apps', 'web', 'AGENTS.md'].join(String.fromCharCode(92)))).toBe(true);
    });
});
