export { diffRoutes, hasDifferences } from './routeDiffer';
export type { RouteDiff, DiffResult, ChangeType } from './routeDiffer';

import { DiffResult, RouteDiff } from './routeDiffer';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  dim: '\x1b[2m',
};

function formatRoute(diff: RouteDiff): string {
  const { method, path, handler } = diff.route;
  const tag = `[${method.toUpperCase()}] ${path}`;
  if (diff.changeType === 'modified' && diff.previous) {
    return `${tag} (handler: ${diff.previous.handler} → ${handler})`;
  }
  return handler ? `${tag} (${handler})` : tag;
}

export function formatDiff(result: DiffResult): string {
  const lines: string[] = [];

  for (const diff of result.added) {
    lines.push(`${COLORS.green}+ ${formatRoute(diff)}${COLORS.reset}`);
  }

  for (const diff of result.removed) {
    lines.push(`${COLORS.red}- ${formatRoute(diff)}${COLORS.reset}`);
  }

  for (const diff of result.modified) {
    lines.push(`${COLORS.yellow}~ ${formatRoute(diff)}${COLORS.reset}`);
  }

  if (lines.length === 0) {
    lines.push(`${COLORS.dim}No route changes detected.${COLORS.reset}`);
  }

  const summary = `\nSummary: +${result.added.length} added, -${result.removed.length} removed, ~${result.modified.length} modified, ${result.unchanged.length} unchanged`;
  lines.push(summary);

  return lines.join('\n');
}
