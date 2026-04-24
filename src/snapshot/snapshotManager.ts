import * as fs from 'fs';
import * as path from 'path';
import { serializeRoutes, deserializeRoutes } from '../parser';
import { Route } from '../parser/routeExtractor';

const DEFAULT_SNAPSHOT_DIR = '.routewatch';

export interface SnapshotMeta {
  createdAt: string;
  label?: string;
  routeCount: number;
}

export interface Snapshot {
  meta: SnapshotMeta;
  routes: Route[];
}

export function ensureSnapshotDir(dir: string = DEFAULT_SNAPSHOT_DIR): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function saveSnapshot(
  routes: Route[],
  label?: string,
  dir: string = DEFAULT_SNAPSHOT_DIR
): string {
  ensureSnapshotDir(dir);

  const meta: SnapshotMeta = {
    createdAt: new Date().toISOString(),
    label,
    routeCount: routes.length,
  };

  const snapshot: Snapshot = { meta, routes };
  const filename = `snapshot-${Date.now()}.json`;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), 'utf-8');
  return filepath;
}

export function loadSnapshot(filepath: string): Snapshot {
  if (!fs.existsSync(filepath)) {
    throw new Error(`Snapshot file not found: ${filepath}`);
  }

  const raw = fs.readFileSync(filepath, 'utf-8');
  const parsed = JSON.parse(raw) as Snapshot;

  if (!parsed.meta || !Array.isArray(parsed.routes)) {
    throw new Error(`Invalid snapshot format in: ${filepath}`);
  }

  return parsed;
}

export function listSnapshots(dir: string = DEFAULT_SNAPSHOT_DIR): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith('snapshot-') && f.endsWith('.json'))
    .map((f) => path.join(dir, f))
    .sort();
}

export function getLatestSnapshot(dir: string = DEFAULT_SNAPSHOT_DIR): Snapshot | null {
  const snapshots = listSnapshots(dir);
  if (snapshots.length === 0) return null;
  return loadSnapshot(snapshots[snapshots.length - 1]);
}
