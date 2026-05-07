import { formatReport, formatTextReport, formatMarkdownReport, formatJsonReport } from './reportFormatter';
import type { RouteDiff } from '../diff/routeDiffer';
import * as fs from 'fs';
import * as path from 'path';

export type ReportFormat = 'text' | 'markdown' | 'json';

export interface ReportOptions {
  format: ReportFormat;
  outputFile?: string;
  title?: string;
}

/**
 * Generates a formatted report of route diffs.
 * Optionally writes the report to a file if `outputFile` is specified.
 *
 * @param diffs - Array of route differences to report on
 * @param options - Reporting options including format, output file, and title
 * @returns The formatted report as a string
 */
export function generateReport(
  diffs: RouteDiff[],
  options: ReportOptions
): string {
  const { format, title } = options;

  let output: string;

  switch (format) {
    case 'markdown':
      output = formatMarkdownReport(diffs, title);
      break;
    case 'json':
      output = formatJsonReport(diffs);
      break;
    case 'text':
    default:
      output = formatTextReport(diffs, title);
      break;
  }

  if (options.outputFile) {
    const dir = path.dirname(options.outputFile);
    if (dir && dir !== '.') {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(options.outputFile, output, 'utf-8');
  }

  return output;
}

/**
 * Generates a report and prints it to stdout.
 *
 * @param diffs - Array of route differences to report on
 * @param format - Output format (default: 'text')
 * @param title - Optional report title
 */
export function printReport(
  diffs: RouteDiff[],
  format: ReportFormat = 'text',
  title?: string
): void {
  const output = generateReport(diffs, { format, title });
  console.log(output);
}

/**
 * Returns a summary of the diffs: total count broken down by change type.
 *
 * @param diffs - Array of route differences to summarize
 * @returns An object with counts for added, removed, and modified routes
 */
export function summarizeDiffs(diffs: RouteDiff[]): { added: number; removed: number; modified: number; total: number } {
  const added = diffs.filter((d) => d.type === 'added').length;
  const removed = diffs.filter((d) => d.type === 'removed').length;
  const modified = diffs.filter((d) => d.type === 'modified').length;
  return { added, removed, modified, total: diffs.length };
}

export { formatReport, formatTextReport, formatMarkdownReport, formatJsonReport };
