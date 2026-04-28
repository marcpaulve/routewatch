import { RouteStats } from './routeStats';

export function formatStatsText(stats: RouteStats): string {
  const lines: string[] = [];

  lines.push('=== Route Statistics ===');
  lines.push(`Total routes      : ${stats.total}`);
  lines.push(`Unique paths      : ${stats.uniquePaths}`);
  lines.push(`Avg path depth    : ${stats.averagePathDepth.toFixed(2)}`);
  lines.push(`Deepest path      : ${stats.deepestPath || 'N/A'}`);
  lines.push(`Most common method: ${stats.mostCommonMethod || 'N/A'}`);

  lines.push('');
  lines.push('By Method:');
  for (const [method, count] of Object.entries(stats.byMethod).sort()) {
    lines.push(`  ${method.padEnd(8)}: ${count}`);
  }

  lines.push('');
  lines.push('By Prefix:');
  for (const [prefix, count] of Object.entries(stats.byPrefix).sort()) {
    lines.push(`  ${prefix.padEnd(20)}: ${count}`);
  }

  if (stats.duplicatePaths.length > 0) {
    lines.push('');
    lines.push('Duplicate Paths:');
    for (const p of stats.duplicatePaths) {
      lines.push(`  ${p}`);
    }
  }

  return lines.join('\n');
}

export function formatStatsJson(stats: RouteStats): string {
  return JSON.stringify(stats, null, 2);
}

export function formatStatsMarkdown(stats: RouteStats): string {
  const lines: string[] = [];

  lines.push('## Route Statistics');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total routes | ${stats.total} |`);
  lines.push(`| Unique paths | ${stats.uniquePaths} |`);
  lines.push(`| Avg path depth | ${stats.averagePathDepth.toFixed(2)} |`);
  lines.push(`| Deepest path | \`${stats.deepestPath || 'N/A'}\` |`);
  lines.push(`| Most common method | ${stats.mostCommonMethod || 'N/A'} |`);

  lines.push('');
  lines.push('### By Method');
  lines.push('');
  lines.push('| Method | Count |');
  lines.push('|--------|-------|');
  for (const [method, count] of Object.entries(stats.byMethod).sort()) {
    lines.push(`| ${method} | ${count} |`);
  }

  return lines.join('\n');
}
