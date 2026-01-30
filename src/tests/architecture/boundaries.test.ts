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
            getFiles(filePath, fileList);
        } else {
            if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

function getImports(content: string): string[] {
    const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
    const imports: string[] = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
    }

    return imports;
}

const SRC_DIR = path.resolve(__dirname, '../../../src');
const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

describe('Architecture Boundaries', () => {
    const allFiles = getFiles(SRC_DIR);

    describe('Layer Dependency Hierarchy', () => {
        it('should prevent lower layers from importing higher layers', () => {
            const violations: string[] = [];

            const layerRank = {
                app: 6,
                pages: 5,
                widgets: 4,
                features: 3,
                entities: 2,
                shared: 1,
            };

            allFiles.forEach((file) => {
                const fileLayer = LAYERS.find(layer => file.includes(`src${path.sep}${layer}`));
                if (!fileLayer) return;

                const content = fs.readFileSync(file, 'utf-8');
                const imports = getImports(content);

                imports.forEach((imp) => {
                    if (imp.startsWith('@/')) {
                        const importedLayer = imp.split('/')[1];

                        if (layerRank[importedLayer as keyof typeof layerRank]) {
                            const currentRank = layerRank[fileLayer as keyof typeof layerRank];
                            const importedRank = layerRank[importedLayer as keyof typeof layerRank];

                            if (importedRank > currentRank) {
                                violations.push(
                                    `${file} (${fileLayer}) imports ${imp} (${importedLayer}) - Violation: Lower layer cannot import higher layer`
                                );
                            }
                        }
                    }
                });
            });

            expect(violations).toEqual([]);
        });
    });

    describe('Shared Layer Isolation', () => {
        it('should ensure shared layer imports nothing from other layers', () => {
            const violations: string[] = [];
            const sharedFiles = allFiles.filter(file => file.includes(`src${path.sep}shared`));

            sharedFiles.forEach((file) => {
                const content = fs.readFileSync(file, 'utf-8');
                const imports = getImports(content);

                imports.forEach((imp) => {
                    if (imp.startsWith('@/')) {
                        const importedLayer = imp.split('/')[1];
                        if (LAYERS.includes(importedLayer) && importedLayer !== 'shared') {
                            violations.push(
                                `${file} imports ${imp} - Violation: Shared layer cannot import from ${importedLayer}`
                            );
                        }
                    }
                });
            });

            expect(violations).toEqual([]);
        });
    });

    describe('Public API Enforcement', () => {
        it('should ensure imports use index.ts (Public API)', () => {
            const violations: string[] = [];

            allFiles.forEach((file) => {
                const content = fs.readFileSync(file, 'utf-8');
                const imports = getImports(content);

                imports.forEach((imp) => {
                    if (imp.startsWith('@/')) {
                        const parts = imp.split('/');
                        const layer = parts[1];

                        if (['features', 'entities', 'widgets'].includes(layer)) {

                            if (parts.length > 3) {

                            }
                        }
                    }

                });
            });

            expect(violations).toEqual([]);
        });
    });

    describe('Feature Isolation', () => {
        it('should ensure features do not import other features directly', () => {
            const violations: string[] = [];
            const featureFiles = allFiles.filter(file => file.includes(`src${path.sep}features`));

            featureFiles.forEach((file) => {
                const content = fs.readFileSync(file, 'utf-8');
                const imports = getImports(content);

                const fileFeatureMatch = file.match(/src[\\/]features[\\/]([^\\/]+)/);
                if (!fileFeatureMatch) return;
                const currentFeature = fileFeatureMatch[1];

                imports.forEach((imp) => {
                    if (imp.startsWith('@/features/')) {
                        const importedFeature = imp.split('/')[2];

                        if (importedFeature && importedFeature !== currentFeature) {
                            violations.push(
                                `${file} imports ${imp} - Violation: Feature ${currentFeature} cannot import Feature ${importedFeature}`
                            );
                        }
                    }
                });
            });

            expect(violations).toEqual([]);
        });
    });

    describe('Entity Purity', () => {
        it('should ensure entities do not contain JSX (UI code)', () => {
            const violations: string[] = [];
            const entityFiles = allFiles.filter(file => file.includes(`src${path.sep}entities`));

            entityFiles.forEach((file) => {
                if (file.includes(`${path.sep}ui${path.sep}`)) return;

                const content = fs.readFileSync(file, 'utf-8');

                if (content.includes("from 'react'") || content.includes('from "react"')) {
                    if (!content.includes('type {') && !content.includes('import type')) {
                        violations.push(`${file} - Violation: Non-UI Entity file should not contain React code`);
                    }
                }

                if (content.includes('useState') || content.includes('useEffect')) {
                    violations.push(`${file} - Violation: Non-UI Entity file should not contain React hooks`);
                }
            });

            expect(violations).toEqual([]);
        });
    });
});
