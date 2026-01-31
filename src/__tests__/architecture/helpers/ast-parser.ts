import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { readFile } from './file-scanner';
import type { File } from '@babel/types';


export function parseFile(filePath: string): File {
  const content = readFile(filePath);

  return parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
}


export function hasMagicStrings(filePath: string, suspiciousStrings: string[]): boolean {
  try {
    const ast = parseFile(filePath);
    let hasMagic = false;

    traverse(ast, {
      StringLiteral(path) {
        const value = path.node.value;
        if (suspiciousStrings.includes(value)) {

          const parent = path.parent;
          if (
            parent.type !== 'TSLiteralType' &&
            parent.type !== 'ImportDeclaration' &&
            parent.type !== 'ExportNamedDeclaration'
          ) {
            hasMagic = true;
            path.stop();
          }
        }
      },
    });

    return hasMagic;
  } catch {
    return false;
  }
}


export function getSwitchStatements(filePath: string): Array<{
  discriminant: string;
  hasDefault: boolean;
  caseCount: number;
}> {
  try {
    const ast = parseFile(filePath);
    const switches: Array<{ discriminant: string; hasDefault: boolean; caseCount: number }> = [];

    traverse(ast, {
      SwitchStatement(path) {
        const discriminant = path.get('discriminant');
        const cases = path.get('cases');

        const hasDefault = cases.some((c) => c.node.test === null);
        const caseCount = cases.length;

        let discriminantName = 'unknown';
        if (discriminant.isIdentifier()) {
          discriminantName = discriminant.node.name;
        }

        switches.push({
          discriminant: discriminantName,
          hasDefault,
          caseCount,
        });
      },
    });

    return switches;
  } catch {
    return [];
  }
}


export function handlesEnum(switchInfo: { discriminant: string; hasDefault: boolean; caseCount: number }): boolean {


  const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(switchInfo.discriminant);
  const isUpperCase = /^[A-Z_]+$/.test(switchInfo.discriminant);

  return (isPascalCase || isUpperCase) && switchInfo.caseCount > 1;
}


export function hasExhaustiveCheck(filePath: string): boolean {
  const content = readFile(filePath);



  const exhaustivePattern = /default:\s*(?:const|let)\s+\w+:\s*never\s*=/;

  return exhaustivePattern.test(content);
}


export function hasDomainSpecificTypes(filePath: string): boolean {
  try {
    const ast = parseFile(filePath);
    let hasDomain = false;


    const domainKeywords = ['User', 'Car', 'Rental', 'Damage', 'Payment', 'Booking', 'Customer', 'Vehicle'];

    traverse(ast, {
      TSTypeAliasDeclaration(path) {
        const typeName = path.node.id.name;
        if (domainKeywords.some((keyword) => typeName.includes(keyword))) {
          hasDomain = true;
          path.stop();
        }
      },
      TSInterfaceDeclaration(path) {
        const interfaceName = path.node.id.name;
        if (domainKeywords.some((keyword) => interfaceName.includes(keyword))) {
          hasDomain = true;
          path.stop();
        }
      },
    });

    return hasDomain;
  } catch {
    return false;
  }
}


export function getComplexStates(filePath: string): string[] {
  try {
    const ast = parseFile(filePath);
    const states: string[] = [];

    traverse(ast, {
      TSTypeAliasDeclaration(path) {
        const typeName = path.node.id.name;

        if (/State|Status|Mode|Phase/.test(typeName)) {
          states.push(typeName);
        }
      },
    });

    return states;
  } catch {
    return [];
  }
}


export function hasDiscriminator(filePath: string, typeName: string): boolean {
  const content = readFile(filePath);



  const discriminatorPattern = new RegExp(`type\\s+${typeName}\\s*=\\s*[^;]*\\{[^}]*(?:type|kind|status):\\s*['"]`);

  return discriminatorPattern.test(content);
}


export function hasComplexJSX(filePath: string): boolean {
  try {
    const ast = parseFile(filePath);
    let isComplex = false;
    let jsxDepth = 0;
    const MAX_SIMPLE_DEPTH = 3;

    traverse(ast, {
      JSXElement: {
        enter() {
          jsxDepth++;
          if (jsxDepth > MAX_SIMPLE_DEPTH) {
            isComplex = true;
          }
        },
        exit() {
          jsxDepth--;
        },
      },
      JSXFragment: {
        enter() {
          jsxDepth++;
          if (jsxDepth > MAX_SIMPLE_DEPTH) {
            isComplex = true;
          }
        },
        exit() {
          jsxDepth--;
        },
      },
    });

    return isComplex;
  } catch {
    return false;
  }
}


export function hasInlineClientComponent(filePath: string): boolean {
  const content = readFile(filePath);


  if (!filePath.includes('/app/') || !filePath.endsWith('page.tsx')) {
    return false;
  }


  const inlineComponentPattern = /(?:const|function)\s+\w+\s*=?\s*\([^)]*\)\s*(?::\s*\w+\s*)?=>\s*\{[^}]*(?:useState|useEffect|useCallback)/;

  return inlineComponentPattern.test(content);
}