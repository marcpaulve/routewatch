export {
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
  getLatestSnapshot,
  ensureSnapshotDir,
} from './snapshotManager';
export type { Snapshot, SnapshotMeta } from './snapshotManager';

import { getLatestSnapshot, saveSnapshot, loadSnapshot } from './snapshotManager';
import { diffRoutes, hasDifferences } from '../diff/routeDiffer';
import { formatDiff } from '../diff';
import { Route } from '../parser/routeExtractor';

export interface CompareResult {
  hasChanges: boolean;
  summary: string;
  snapshotPath: string;
}

/**
 * Save current routes as a new snapshot and compare against the previous one.
 * Returns a CompareResult describing what changed.
 */
export function snapshotAndCompare(
  currentRoutes: Route[],
  label?: string,
  dir?: string
): CompareResult {
  const previous = getLatestSnapshot(dir);
  const snapshotPath = saveSnapshot(currentRoutes, label, dir);

  if (!previous) {
    return {
      hasChanges: false,
      summary: `No previous snapshot found. Saved ${currentRoutes.length} route(s) as baseline.`,
      snapshotPath,
    };
  }

  const diff = diffRoutes(previous.routes, currentRoutes);
  const hasChanges = hasDifferences(diff);

  const lines: string[] = [];
  if (!hasChanges) {
    lines.push('No route changes detected.');
  } else {
    lines.push(`Route changes detected (vs snapshot from ${previous.meta.createdAt}):`);
    lines.push(formatDiff(diff));
  }

  return {
    hasChanges,
    summary: lines.join('\n'),
    snapshotPath,
  };
}
