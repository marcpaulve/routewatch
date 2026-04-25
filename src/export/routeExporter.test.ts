import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exportRoutes, exportDiff, formatCsvRoutes } from './routeExporter';
import { Route } from '../parser';
import { DiffResult } from '../diff/routeDiffer';

const mockRoutes: Route[] = [
  { method: 'GET', path: '/users', middleware: ['auth'] },
  { method: 'POST', path: '/users', middleware: [] },
  { method: 'DELETE', path: '/users/:id', middleware: ['auth', 'admin'] },
];

const mockDiff: DiffResult = {
  added: [{ method: 'PATCH', path: '/users/:id', middleware: [] }],
  removed: [{ method: 'DELETE', path: '/users/:id', middleware: ['auth'] }],
  changed: [],
};

describe('formatCsvRoutes', () => {
  it('should produce a CSV with header and rows', () => {
    const csv = formatCsvRoutes(mockRoutes);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('method,path,middleware');
    expect(lines[1]).toBe('GET,/users,auth');
    expect(lines[2]).toBe('POST,/users,');
    expect(lines[3]).toBe('DELETE,/users/:id,auth;admin');
  });

  it('should handle routes with no middleware', () => {
    const csv = formatCsvRoutes([{ method: 'GET', path: '/health' }]);
    expect(csv).toContain('GET,/health,');
  });
});

describe('exportRoutes', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-export-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should export routes as JSON', () => {
    const outPath = path.join(tmpDir, 'routes.json');
    exportRoutes(mockRoutes, { format: 'json', outputPath: outPath });
    const content = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
    expect(content).toHaveLength(3);
    expect(content[0].method).toBe('GET');
  });

  it('should export routes as CSV', () => {
    const outPath = path.join(tmpDir, 'routes.csv');
    exportRoutes(mockRoutes, { format: 'csv', outputPath: outPath });
    const content = fs.readFileSync(outPath, 'utf-8');
    expect(content).toContain('method,path,middleware');
    expect(content).toContain('GET,/users,auth');
  });

  it('should create nested output directories if needed', () => {
    const outPath = path.join(tmpDir, 'nested', 'dir', 'routes.json');
    exportRoutes(mockRoutes, { format: 'json', outputPath: outPath });
    expect(fs.existsSync(outPath)).toBe(true);
  });

  it('should throw on unsupported format', () => {
    expect(() =>
      exportRoutes(mockRoutes, { format: 'xml' as any, outputPath: path.join(tmpDir, 'out.xml') })
    ).toThrow('Unsupported export format');
  });
});

describe('exportDiff', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-diff-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should export diff as JSON', () => {
    const outPath = path.join(tmpDir, 'diff.json');
    exportDiff(mockDiff, { format: 'json', outputPath: outPath });
    const content = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
    expect(content.added).toHaveLength(1);
    expect(content.removed).toHaveLength(1);
  });

  it('should throw when exporting diff as CSV', () => {
    expect(() =>
      exportDiff(mockDiff, { format: 'csv' as any, outputPath: path.join(tmpDir, 'diff.csv') })
    ).toThrow("Export format 'csv' is not supported for diffs");
  });
});
