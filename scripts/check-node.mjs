import { readFileSync } from 'node:fs';

const { engines } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const allowed = [...String(engines?.node ?? '').matchAll(/(\d+)(?:\.\d+)*/g)].map((match) => Number(match[1]));
const current = Number(process.versions.node.split('.')[0]);

if (allowed.length > 0 && !allowed.includes(current)) {
  console.error(`check-node: Node ${process.versions.node} is not supported; package.json engines.node is "${engines.node}"`);
  process.exit(1);
}

console.log(`check-node: Node ${process.versions.node} OK (engines ${engines?.node})`);
