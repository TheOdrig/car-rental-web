import { glob } from 'glob';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export async function scanFiles(
  pattern: string,
  options?: {
    hasUseClient?: boolean;
    exclude?: string[];
  }
): Promise<string[]> {
  const files = await glob(pattern, {
    ignore: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      ...(options?.exclude || []),
    ],
  });

  if (files.length === 0) {
    throw new Error(`Architecture scan matched no files: ${pattern}`);
  }

  if (options?.hasUseClient !== undefined) {
    const filtered = files.filter((file) => {
      const content = readFileSync(file, 'utf-8');
      const hasDirective = content.includes("'use client'") || content.includes('"use client"');
      return options.hasUseClient ? hasDirective : !hasDirective;
    });
    if (filtered.length === 0) {
      throw new Error(`Architecture scan matched no files after the client filter: ${pattern}`);
    }
    return filtered;
  }

  return files;
}

export function readFile(filePath: string): string {
  return readFileSync(resolve(filePath), 'utf-8');
}

export function fileExists(filePath: string): boolean {
  try {
    readFileSync(resolve(filePath), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export function hasUseClientDirective(filePath: string): boolean {
  const content = readFile(filePath);
  return content.includes("'use client'") || content.includes('"use client"');
}

export function usesClientFeatures(filePath: string): boolean {
  const content = readFile(filePath);

  const clientHooks = [
    'useState',
    'useEffect',
    'useLayoutEffect',
    'useReducer',
    'useCallback',
    'useMemo',
    'useRef',
    'useImperativeHandle',
    'useContext',
    'useSyncExternalStore',
    'useTransition',
    'useDeferredValue',
    'useId',
  ];

  const hasHooks = clientHooks.some((hook) => {
    const regex = new RegExp(`\\b${hook}\\s*\\(`, 'g');
    return regex.test(content);
  });

  if (hasHooks) return true;

  const radixImports = [
    '@radix-ui/',
    'react-hook-form',
    'sonner',
    'recharts',
  ];

  const hasRadixImports = radixImports.some((pkg) => content.includes(`from "${pkg}`) || content.includes(`from '${pkg}`));

  if (hasRadixImports) return true;

  const eventHandlers = [
    'onClick',
    'onChange',
    'onSubmit',
    'onFocus',
    'onBlur',
    'onKeyDown',
    'onKeyUp',
    'onMouseEnter',
    'onMouseLeave',
  ];

  const hasEventHandlers = eventHandlers.some((handler) => {
    const regex = new RegExp(`\\b${handler}\\s*=`, 'g');
    return regex.test(content);
  });

  if (hasEventHandlers) return true;

  const browserAPIs = [
    'window\\.',
    'document\\.',
    'localStorage',
    'sessionStorage',
    'navigator\\.',
  ];

  const hasBrowserAPIs = browserAPIs.some((api) => {
    const regex = new RegExp(api, 'g');
    return regex.test(content);
  });

  return hasBrowserAPIs;
}

export function isAsyncComponent(filePath: string): boolean {
  const content = readFile(filePath);

  return /export\s+default\s+async\s+function/.test(content);
}

export function hasFetchCalls(filePath: string): boolean {
  const content = readFile(filePath);
  return /\bfetch\s*\(/.test(content) || /\bawait\s+fetch\s*\(/.test(content);
}

export function isInFeatureOrWidget(filePath: string): boolean {
  return filePath.includes('/features/') || filePath.includes('/widgets/');
}