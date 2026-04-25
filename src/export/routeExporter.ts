import * as fs from 'fs';
import * as path from 'path';
import { Route } from '../parser';
import { formatJsonReport, formatMarkdownReport, formatTextReport } from '../reporter/reportFormatter';
import { DiffResult } from '../diff/routeDiffer';

export type ExportFormat = 'json' | 'markdown' | 'text' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  outputPath: string;
  pretty?: boolean;
}

export function formatCsvRoutes(routes: Route[]): string {
  const header = 'method,path,middleware';
  const rows = routes.map((r) => {
    const middleware = (r.middleware ?? []).join(';');
    return `${r.method},${r.path},${middleware}`;
  });
  return [header, ...rows].join('\n');
}

export function exportRoutes(routes: Route[], options: ExportOptions): void {
  const dir = path.dirname(options.outputPath);
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let content: string;

  switch (options.format) {
    case 'json':
      content = JSON.stringify(routes, null, options.pretty !== false ? 2 : 0);
      break;
    case 'markdown':
      content = formatMarkdownReport({ added: [], removed: [], changed: [] }, routes);
      break;
    case 'text':
      content = formatTextReport({ added: [], removed: [], changed: [] }, routes);
      break;
    case 'csv':
      content = formatCsvRoutes(routes);
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }

  fs.writeFileSync(options.outputPath, content, 'utf-8');
}

export function exportDiff(diff: DiffResult, options: ExportOptions): void {
  const dir = path.dirname(options.outputPath);
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let content: string;

  switch (options.format) {
    case 'json':
      content = JSON.stringify(diff, null, options.pretty !== false ? 2 : 0);
      break;
    case 'markdown':
      content = formatMarkdownReport(diff, []);
      break;
    case 'text':
      content = formatTextReport(diff, []);
      break;
    default:
      throw new Error(`Export format '${options.format}' is not supported for diffs. Use json, markdown, or text.`);
  }

  fs.writeFileSync(options.outputPath, content, 'utf-8');
}
