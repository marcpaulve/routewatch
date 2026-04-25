export { exportRoutes, exportDiff, formatCsvRoutes } from './routeExporter';
export type { ExportFormat, ExportOptions } from './routeExporter';

import { exportRoutes, exportDiff, ExportOptions } from './routeExporter';
import { Route } from '../parser';
import { DiffResult } from '../diff/routeDiffer';

/**
 * High-level helper: export a route list to a file, inferring format from extension when not specified.
 */
export function exportToFile(
  data: Route[] | DiffResult,
  outputPath: string,
  options?: Partial<ExportOptions>
): void {
  const inferredFormat = inferFormatFromPath(outputPath);
  const resolvedOptions: ExportOptions = {
    format: options?.format ?? inferredFormat,
    outputPath,
    pretty: options?.pretty ?? true,
  };

  if (Array.isArray(data)) {
    exportRoutes(data as Route[], resolvedOptions);
  } else {
    exportDiff(data as DiffResult, resolvedOptions);
  }
}

function inferFormatFromPath(filePath: string): ExportOptions['format'] {
  const ext = filePath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'json':
      return 'json';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'csv':
      return 'csv';
    case 'txt':
    default:
      return 'text';
  }
}
