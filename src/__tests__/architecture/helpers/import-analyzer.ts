import { readFile } from './file-scanner';
import { resolve, dirname } from 'path';


export function getImports(filePath: string): string[] {
  const content = readFile(filePath);
  const imports: string[] = [];


  const es6ImportRegex = /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;

  while ((match = es6ImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }


  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }


  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}


export function resolveImport(importPath: string, fromFile?: string): string | null {

  if (importPath.startsWith('@/')) {
    const relativePath = importPath.replace('@/', 'src/');
    return resolve(process.cwd(), relativePath);
  }


  if (importPath.startsWith('.') && fromFile) {
    const dir = dirname(fromFile);
    return resolve(dir, importPath);
  }


  if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
    return null;
  }

  return null;
}


export function isImportFromLayer(importPath: string, layer: string): boolean {
  return importPath.includes(`/${layer}/`);
}


export function getImportsFromLayer(filePath: string, layer: string): string[] {
  const imports = getImports(filePath);
  return imports.filter((imp) => isImportFromLayer(imp, layer));
}


export function getCrossFeatureImports(filePath: string): string[] {

  if (!filePath.includes('/features/')) {
    return [];
  }


  const featureMatch = filePath.match(/\/features\/([^/]+)\//);
  if (!featureMatch) {
    return [];
  }

  const currentFeature = featureMatch[1];
  const imports = getImports(filePath);


  return imports.filter((imp) => {
    if (!imp.includes('/features/')) {
      return false;
    }


    const importedFeatureMatch = imp.match(/\/features\/([^/]+)(?:\/|$)/);
    if (!importedFeatureMatch) {
      return false;
    }

    const importedFeature = importedFeatureMatch[1];


    if (importedFeature === currentFeature) {
      return false;
    }




    const isPublicAPI = imp === `@/features/${importedFeature}` || imp.endsWith(`/features/${importedFeature}`);

    return !isPublicAPI;
  });
}


export function getExports(filePath: string): string[] {
  const content = readFile(filePath);
  const exports: string[] = [];


  const namedExportRegex = /export\s+\{\s*([^}]+)\s*\}/g;
  let match;

  while ((match = namedExportRegex.exec(content)) !== null) {
    const names = match[1].split(',').map((n) => n.trim().split(/\s+as\s+/)[0]);
    exports.push(...names);
  }


  const declarationRegex = /export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g;
  while ((match = declarationRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }


  if (/export\s+default/.test(content)) {
    exports.push('default');
  }

  return exports;
}


export function hasBusinessLogic(filePath: string): boolean {
  const content = readFile(filePath);


  const logicPatterns = [
    /if\s*\([^)]+\)\s*\{[^}]{50,}\}/g,
    /switch\s*\([^)]+\)\s*\{/g,
    /for\s*\([^)]+\)\s*\{/g,
    /while\s*\([^)]+\)\s*\{/g,
    /\.map\([^)]+\)\s*\{[^}]{30,}\}/g,
    /\.filter\([^)]+\)\s*\{[^}]{30,}\}/g,
    /\.reduce\([^)]+\)\s*\{[^}]{30,}\}/g,
  ];

  return logicPatterns.some((pattern) => pattern.test(content));
}


export function hasAPIcalls(filePath: string): boolean {
  const content = readFile(filePath);
  return (
    /\bfetch\s*\(/.test(content) ||
    /\baxios\s*\./.test(content) ||
    /\bclientGet\s*\(/.test(content) ||
    /\bclientPost\s*\(/.test(content) ||
    /\bclientPut\s*\(/.test(content) ||
    /\bclientDelete\s*\(/.test(content)
  );
}