const toolFolders = ['kiro', 'agent', 'agents', 'claude', 'codex', 'cursor', 'windsurf', 'obsidian'];
const rootFolders = ['kiro.steering', 'specs', 'UIdesign'];
const instructionFiles = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md'];

function escapeDots(value) {
  return value.split('.').join('\\.');
}

const forbidden = [
  ...toolFolders.map((name) => new RegExp(`(^|/)\\.${name}/`)),
  ...rootFolders.map((name) => new RegExp(`(^|/)${escapeDots(name)}/`)),
  ...instructionFiles.map((name) => new RegExp(`(^|/)${escapeDots(name)}$`)),
  /(^|\/)\.aider[^/]*(\/|$)/,
  /(^|\/)\.github\/copilot-instructions\.md$/,
  /(^|\/)docs\//,
  /Zone\.Identifier$/,
];

export function isForbiddenPath(path) {
  const normalized = path.split(String.fromCharCode(92)).join('/');
  return forbidden.some((pattern) => pattern.test(normalized));
}
