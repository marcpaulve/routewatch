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

export function printReport(
  diffs: RouteDiff[],
  format: ReportFormat = 'text',
  title?: string
): void {
  const output = generateReport(diffs, { format, title });
  console.log(output);
}

export { formatReport, formatTextReport, formatMarkdownReport, formatJsonReport };
