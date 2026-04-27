/**
 * routewatch - Main entry point
 *
 * Exposes the public API for programmatic usage and wires up the CLI.
 */

// Parser
export { parseRoutes, serializeRoutes, deserializeRoutes } from './parser/index';
export { extractRoutesFromFile, extractRoutesFromDirectory } from './parser/routeExtractor';

// Diff
export { routeKey, diffRoutes, hasDifferences } from './diff/routeDiffer';
export { formatRoute, formatDiff } from './diff/index';

// Snapshot
export { ensureSnapshotDir, saveSnapshot, loadSnapshot, listSnapshots, getLatestSnapshot } from './snapshot/snapshotManager';
export { snapshotAndCompare } from './snapshot/index';

// Reporter
export { formatReport, formatTextReport, formatMarkdownReport, formatJsonReport } from './reporter/reportFormatter';
export { generateReport, printReport } from './reporter/index';

// Filter
export { normalizeMethod, filterByMethod, filterByPathPrefix, filterByPathPattern, applyFilters } from './filter/routeFilter';
export { filterRoutes } from './filter/index';

// Watcher
export { createRouteWatcher } from './watcher/routeWatcher';

// Export
export { formatCsvRoutes, exportRoutes, exportDiff } from './export/routeExporter';
export { exportToFile, inferFormatFromPath } from './export/index';

// Audit
export { auditRoutes } from './audit/routeAuditor';
export { runAudit, formatAuditResult } from './audit/index';

// Compare
export { normalizePath, normalizeRoute, compareRoutes } from './compare/routeComparer';

// CLI factory — useful when embedding routewatch in other tooling
export { createCLI } from './cli/index';

// Re-export core types so consumers don't need to reach into sub-modules
export type { Route, RouteDiff, SnapshotMeta, AuditResult, FilterOptions, ExportFormat } from './types';

/**
 * Convenience function: parse routes from a directory, optionally compare
 * against the latest snapshot, and return a structured report.
 *
 * @param sourceDir   - Directory containing Express/Fastify source files
 * @param snapshotDir - Directory where snapshots are stored
 * @param options     - Optional filter and report options
 */
import { parseRoutes } from './parser/index';
import { getLatestSnapshot, saveSnapshot } from './snapshot/snapshotManager';
import { diffRoutes } from './diff/routeDiffer';
import { generateReport } from './reporter/index';
import { filterRoutes } from './filter/index';
import type { FilterOptions, ReportOptions } from './types';

export async function watch(
  sourceDir: string,
  snapshotDir: string,
  options: { filter?: FilterOptions; report?: ReportOptions } = {}
): Promise<{ added: number; removed: number; changed: number; report: string }> {
  // Parse current routes from source
  const current = await parseRoutes(sourceDir);

  // Apply optional filters
  const filtered = options.filter ? filterRoutes(current, options.filter) : current;

  // Load the latest snapshot for comparison (may be undefined on first run)
  const previous = await getLatestSnapshot(snapshotDir);

  // Compute diff
  const diff = diffRoutes(previous ?? [], filtered);

  // Persist new snapshot
  await saveSnapshot(snapshotDir, filtered);

  // Generate human-readable report
  const report = generateReport(diff, options.report);

  return {
    added: diff.added.length,
    removed: diff.removed.length,
    changed: diff.changed.length,
    report,
  };
}
