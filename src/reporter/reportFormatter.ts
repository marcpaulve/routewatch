import { DiffResult } from '../diff/routeDiffer';
import { formatDiff } from '../diff/index';

export type ReportFormat = 'text' | 'json' | 'markdown';

export interface ReportOptions {
  format: ReportFormat;
  showUnchanged?: boolean;
  title?: string;
}

export function formatReport(diff: DiffResult, options: ReportOptions): string {
  switch (options.format) {
    case 'json':
      return formatJsonReport(diff, options);
    case 'markdown':
      return formatMarkdownReport(diff, options);
    case 'text':
    default:
      return formatTextReport(diff, options);
  }
}

function formatTextReport(diff: DiffResult, options: ReportOptions): string {
  const lines: string[] = [];
  const title = options.title ?? 'Route Diff Report';

  lines.push(`=== ${title} ===`);
  lines.push('');

  if (diff.added.length === 0 && diff.removed.length === 0 && diff.modified.length === 0) {
    lines.push('No route changes detected.');
    return lines.join('\n');
  }

  lines.push(formatDiff(diff));

  lines.push('');
  lines.push(`Summary: +${diff.added.length} added, -${diff.removed.length} removed, ~${diff.modified.length} modified`);

  return lines.join('\n');
}

function formatMarkdownReport(diff: DiffResult, options: ReportOptions): string {
  const lines: string[] = [];
  const title = options.title ?? 'Route Diff Report';

  lines.push(`## ${title}`);
  lines.push('');

  if (diff.added.length === 0 && diff.removed.length === 0 && diff.modified.length === 0) {
    lines.push('> No route changes detected.');
    return lines.join('\n');
  }

  if (diff.added.length > 0) {
    lines.push('### Added Routes');
    diff.added.forEach(r => lines.push(`- \`${r.method} ${r.path}\``));
    lines.push('');
  }

  if (diff.removed.length > 0) {
    lines.push('### Removed Routes');
    diff.removed.forEach(r => lines.push(`- \`${r.method} ${r.path}\``));
    lines.push('');
  }

  if (diff.modified.length > 0) {
    lines.push('### Modified Routes');
    diff.modified.forEach(({ before, after }) =>
      lines.push(`- \`${before.method} ${before.path}\` → \`${after.method} ${after.path}\``))
    lines.push('');
  }

  lines.push(`**Summary:** +${diff.added.length} added, -${diff.removed.length} removed, ~${diff.modified.length} modified`);

  return lines.join('\n');
}

function formatJsonReport(diff: DiffResult, options: ReportOptions): string {
  return JSON.stringify(
    {
      title: options.title ?? 'Route Diff Report',
      summary: {
        added: diff.added.length,
        removed: diff.removed.length,
        modified: diff.modified.length,
      },
      diff,
    },
    null,
    2
  );
}
