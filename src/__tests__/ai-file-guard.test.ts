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
        'notes/log.md',
        'notes/adr/decision.md',
        'NOTES/private.md',
        'docs/.claude/settings.json',
        'docs/AGENTS.md',
        'specs/plan.md',
        'Claude.md',
        '.Cursor/rules/a.mdc',
        'CHANGELOG.md',
        'nested/CONTRIBUTING.md',
        '.cursorrules',
        '.windsurfrules',
        'kiro.steering/product.md',
        'image.png:Zone.Identifier',
        '.gemini/settings.json',
        '.clinerules',
        '.clinerules/rules.md',
        '.github/instructions/ts.instructions.md',
        'prompts/system.md',
        'steering/product.md',
        'docs/steering/tech.md',
    ])('blocks %s', (path) => {
        expect(isForbiddenPath(path)).toBe(true);
    });

    it.each([
        'README.md',
        'CONTRIBUTING.md',
        'SECURITY.md',
        'docs/README.md',
        'docs/adr/ADR-001-fsd-architecture.md',
        'LICENSE',
        'docs-public/screenshots/home.png',
        'src/app/page.tsx',
        'src/app/api/admin/users/[id]/notes/route.ts',
        '.github/workflows_disabled/README.md',
        'scripts/verify.sh',
        'mydocs/readme.md',
        'src/shared/ui/aider.tsx',
        'src/GEMINI.md.txt',
        'src/prompts/index.ts',
        'docs/prompts/readme.md',
        'xkiro/a.md',
        'GEMINIxmd',
        '.github/workflows/ci.yml',
    ])('allows %s', (path) => {
        expect(isForbiddenPath(path)).toBe(false);
    });

    it('treats Windows separators like slashes', () => {
        expect(isForbiddenPath(['apps', 'web', 'AGENTS.md'].join(String.fromCharCode(92)))).toBe(true);
        expect(isForbiddenPath(['notes', 'log.md'].join(String.fromCharCode(92)))).toBe(true);
    });
});
