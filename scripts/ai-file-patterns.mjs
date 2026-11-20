const toolFolders = ['kiro', 'agent', 'agents', 'claude', 'codex', 'cursor', 'windsurf', 'obsidian'];
const rootFolders = ['kiro.steering', 'specs', 'UIdesign'];
const instructionFiles = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'CHANGELOG.md', 'CONTRIBUTING.md', '.cursorrules', '.windsurfrules'];

function escapeDots(value) {
  return value.split('.').join('\.');
}

const forbidden = [
  ...toolFolders.map((name) => new RegExp(`(^|/)\.${name}/`, 'i')),
  ...rootFolders.map((name) => new RegExp(`(^|/)${escapeDots(name)}/`, 'i')),
  ...instructionFiles.map((name) => new RegExp(`(^|/)${escapeDots(name)}$`, 'i')),
  /(^|\/)\.aider[^/]*(\/|$)/i,
  /(^|\/)\.github\/copilot-instructions\.md$/i,
  /^notes\//i,
  /Zone\.Identifier$/i,
];

export function isForbiddenPath(path) {
  const normalized = path.split(String.fromCharCode(92)).join('/');
  if (/^CONTRIBUTING\.md$/i.test(normalized)) return false;
  return forbidden.some((pattern) => pattern.test(normalized));
}
