export { extractRoutesFromFile, extractRoutesFromDirectory } from './routeExtractor';
export type { RouteEntry } from './routeExtractor';

import { extractRoutesFromFile, extractRoutesFromDirectory, RouteEntry } from './routeExtractor';
import * as fs from 'fs';

/**
 * Parses routes from a given path, auto-detecting whether it is
 * a single file or a directory.
 */
export function parseRoutes(targetPath: string): RouteEntry[] {
  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    return extractRoutesFromDirectory(targetPath);
  }
  return extractRoutesFromFile(targetPath);
}

/**
 * Serialises a list of routes to a canonical JSON snapshot string.
 * Routes are sorted to ensure deterministic output for diffing.
 */
export function serializeRoutes(routes: RouteEntry[]): string {
  const sorted = [...routes].sort((a, b) => {
    const methodCmp = a.method.localeCompare(b.method);
    if (methodCmp !== 0) return methodCmp;
    return a.path.localeCompare(b.path);
  });

  const normalized = sorted.map(({ method, path }) => ({ method, path }));
  return JSON.stringify(normalized, null, 2);
}

/**
 * Deserialises a JSON snapshot string back into a RouteEntry array.
 */
export function deserializeRoutes(json: string): RouteEntry[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      throw new Error('Snapshot must be a JSON array');
    }
    return parsed as RouteEntry[];
  } catch (err) {
    throw new Error(`Failed to parse route snapshot: ${(err as Error).message}`);
  }
}
