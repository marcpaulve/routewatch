import { generateReport, printReport, ReportFormat } from './index';
import type { RouteDiff } from '../diff/routeDiffer';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');

const mockDiffs: RouteDiff[] = [
  { type: 'added', route: { method: 'GET', path: '/users', handler: 'getUsers' } },
  { type: 'removed', route: { method: 'DELETE', path: '/posts/:id', handler: 'deletePost' } },
  {
    type: 'modified',
    route: { method: 'PUT', path: '/users/:id', handler: 'updateUserV2' },
    previousRoute: { method: 'PUT', path: '/users/:id', handler: 'updateUser' },
  },
];

describe('generateReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.mkdirSync as jest.Mock).mockImplementation(() => undefined);
    (fs.writeFileSync as jest.Mock).mockImplementation(() => undefined);
  });

  it('returns text report by default', () => {
    const result = generateReport(mockDiffs, { format: 'text' });
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns markdown report when format is markdown', () => {
    const result = generateReport(mockDiffs, { format: 'markdown' });
    expect(result).toContain('#');
  });

  it('returns valid JSON when format is json', () => {
    const result = generateReport(mockDiffs, { format: 'json' });
    expect(() => JSON.parse(result)).not.toThrow();
    const parsed = JSON.parse(result);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it('writes output to file when outputFile is specified', () => {
    const outputFile = 'reports/output.txt';
    generateReport(mockDiffs, { format: 'text', outputFile });
    expect(fs.mkdirSync).toHaveBeenCalledWith('reports', { recursive: true });
    expect(fs.writeFileSync).toHaveBeenCalledWith(outputFile, expect.any(String), 'utf-8');
  });

  it('does not call mkdirSync for files in current directory', () => {
    generateReport(mockDiffs, { format: 'text', outputFile: 'output.txt' });
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('includes title in text report when provided', () => {
    const result = generateReport(mockDiffs, { format: 'text', title: 'My Diff Report' });
    expect(result).toContain('My Diff Report');
  });
});

describe('printReport', () => {
  it('calls console.log with formatted output', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printReport(mockDiffs, 'text', 'Test Report');
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    consoleSpy.mockRestore();
  });

  it('defaults to text format', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printReport(mockDiffs);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
