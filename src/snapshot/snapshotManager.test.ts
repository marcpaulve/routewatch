import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
  getLatestSnapshot,
  ensureSnapshotDir,
} from './snapshotManager';
import { Route } from '../parser/routeExtractor';

const TEST_ROUTES: Route[] = [
  { method: 'GET', path: '/users', file: 'routes/users.ts' },
  { method: 'POST', path: '/users', file: 'routes/users.ts' },
  { method: 'DELETE', path: '/users/:id', file: 'routes/users.ts' },
];

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('ensureSnapshotDir', () => {
  it('creates the directory if it does not exist', () => {
    const dir = path.join(tmpDir, 'snapshots');
    ensureSnapshotDir(dir);
    expect(fs.existsSync(dir)).toBe(true);
  });

  it('does not throw if directory already exists', () => {
    ensureSnapshotDir(tmpDir);
    expect(fs.existsSync(tmpDir)).toBe(true);
  });
});

describe('saveSnapshot and loadSnapshot', () => {
  it('saves and reloads routes correctly', () => {
    const filepath = saveSnapshot(TEST_ROUTES, 'v1.0', tmpDir);
    const snapshot = loadSnapshot(filepath);

    expect(snapshot.routes).toEqual(TEST_ROUTES);
    expect(snapshot.meta.label).toBe('v1.0');
    expect(snapshot.meta.routeCount).toBe(3);
    expect(snapshot.meta.createdAt).toBeDefined();
  });

  it('saves snapshot file with a .json extension', () => {
    const filepath = saveSnapshot(TEST_ROUTES, 'v1.0', tmpDir);
    expect(filepath.endsWith('.json')).toBe(true);
  });

  it('throws when loading a non-existent file', () => {
    expect(() => loadSnapshot('/nonexistent/path.json')).toThrow();
  });

  it('throws on invalid snapshot format', () => {
    const badFile = path.join(tmpDir, 'snapshot-bad.json');
    fs.writeFileSync(badFile, JSON.stringify({ foo: 'bar' }));
    expect(() => loadSnapshot(badFile)).toThrow('Invalid snapshot format');
  });

  it('throws on malformed JSON', () => {
    const badFile = path.join(tmpDir, 'snapshot-malformed.json');
    fs.writeFileSync(badFile, 'not valid json {{{');
    expect(() => loadSnapshot(badFile)).toThrow();
  });
});

describe('listSnapshots', () => {
  it('returns empty array when directory does not exist', () => {
    expect(listSnapshots(path.join(tmpDir, 'missing'))).toEqual([]);
  });

  it('returns snapshot files in sorted order', () => {
    saveSnapshot(TEST_ROUTES, 'first', tmpDir);
    saveSnapshot(TEST_ROUTES, 'second', tmpDir);
    const list = listSnapshots(tmpDir);
    expect(list.length).toBe(2);
    expect(list[0] < list[1]).toBe(true);
  });
});

describe('getLatestSnapshot', () => {
  it('returns null when no snapshots exist', () => {
    expect(getLatestSnapshot(path.join(tmpDir, 'empty'))).toBeNull();
  });

  it('returns the most recently saved snapshot', () => {
    saveSnapshot(TEST_ROUTES, 'old', tmpDir);
    saveSnapshot([TEST_ROUTES[0]], 'new', tmpDir);
    const latest = getLatestSnapshot(tmpDir);
    expect(latest?.meta.label).toBe('new');
    expect(latest?.routes.length).toBe(1);
  });
});
