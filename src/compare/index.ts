export { compareRoutes, normalizePath, normalizeRoute } from './routeComparer';
export type { CompareOptions, CompareResult } from './routeComparer';
import { compareRoutes } from './routeComparer';
import { loadSnapshot } from '../snapshot/snapshotManager';
import { parseRoutes } from '../parser';
import { CompareOptions, CompareResult } from './routeComparer';

export async function compareSnapshots(
  baseLabel: string,
  headLabel: string,
  options: CompareOptions = {}
): Promise<CompareResult> {
  const baseSnapshot = await loadSnapshot(baseLabel);
  const headSnapshot = await loadSnapshot(headLabel);

  if (!baseSnapshot) {
    throw new Error(`Snapshot not found: ${baseLabel}`);
  }
  if (!headSnapshot) {
    throw new Error(`Snapshot not found: ${headLabel}`);
  }

  return compareRoutes(baseSnapshot.routes, headSnapshot.routes, options);
}

export async function compareFileToCurrent(
  snapshotLabel: string,
  currentDir: string,
  options: CompareOptions = {}
): Promise<CompareResult> {
  const snapshot = await loadSnapshot(snapshotLabel);
  if (!snapshot) {
    throw new Error(`Snapshot not found: ${snapshotLabel}`);
  }

  const currentRoutes = await parseRoutes(currentDir);
  return compareRoutes(snapshot.routes, currentRoutes, options);
}
