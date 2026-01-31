import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function getFiles(dir: string, fileList: string[] = []): string[] {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== 'dist') {
                getFiles(filePath, fileList);
            }
        } else {
            fileList.push(filePath);
        }
    });
    return fileList;
}

const LAYERS = ['app', 'widgets', 'features', 'entities', 'shared'];

function getImports(content: string): string[] {
    const importRegex = /import\s+.*?\s+from\s+['"](@\/.*?)['"]/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(content)) !== null) {
        matches.push(match[1]);
    }
    return matches;
}

describe('Architecture Boundaries', () => {
    const allFiles = getFiles(path.resolve(process.cwd(), 'src'));

    describe('Layer Dependency Hierarchy', () => {
        it('should prevent lower layers from importing higher layers', () => {
            const violations: string[] = [];

            allFiles.forEach((file) => {
                const fileLayer = LAYERS.find(layer => file.includes(`${path.sep}src${path.sep}${layer}`));
                if (!fileLayer) return;

                if (file.includes('test-utils') || file.includes('factories.ts') || file.includes('__tests__') || file.endsWith('.test.ts') || file.endsWith('.test.tsx')) return;

                const content = fs.readFileSync(file, 'utf-8');
                const imports = getImports(content);

                imports.forEach((imp) => {
                    const impLayer = LAYERS.find(layer => imp.startsWith(`@/${layer}`));
                    if (!impLayer) return;

                    const fileLayerIndex = LAYERS.indexOf(fileLayer);
                    const impLayerIndex = LAYERS.indexOf(impLayer);

                    if (impLayerIndex < fileLayerIndex) {
                        violations.push(`${file} (${fileLayer}) imports from ${imp} (${impLayer})`);
                    }
                });
            });

            expect(violations).toEqual([]);
        });
    });

    describe('Shared Layer Isolation', () => {
        it('should ensure shared layer imports nothing from other layers', () => {
            const violations: string[] = [];
            const sharedFiles = allFiles.filter(file => file.includes(`${path.sep}src${path.sep}shared`));

            sharedFiles.forEach((file) => {
                if (file.includes('test-utils') || file.includes('factories.ts') || file.endsWith('.test.ts') || file.endsWith('.test.tsx')) return;

                const content = fs.readFileSync(file, 'utf-8');
                const imports = getImports(content);

                imports.forEach((imp) => {
                    const impLayer = LAYERS.find(layer => imp.startsWith(`@/${layer}`));
                    if (impLayer && impLayer !== 'shared') {
                        violations.push(`${file} imports from ${imp}`);
                    }
                });
            });

            expect(violations).toEqual([]);
        });
    });

    describe('Public API Enforcement', () => {
        it('should only import from public APIs (index.ts) of other slices', () => {
            const violations: string[] = [];

            allFiles.forEach((file) => {
                if (file.includes('__tests__') || file.includes('testing') || file.endsWith('.test.ts') || file.endsWith('.test.tsx')) return;

                const content = fs.readFileSync(file, 'utf-8');
                const imports = getImports(content);

                imports.forEach((imp) => {
                    if (imp.includes('testing')) return;
                    const parts = imp.split('/');
                    if (parts.length > 3 && ['features', 'entities', 'widgets'].includes(parts[1]) && !parts.includes('@x') && !imp.includes('cached-fetchers')) {
                        violations.push(`${file} performs deep import from ${imp}`);
                    }
                });
            });

            if (violations.length > 0) {
                console.log('Public API Violations:', JSON.stringify(violations, null, 2));
            }
            expect(violations).toEqual([]);
        });
    });
});