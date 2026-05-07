import {
  createTraceEntry,
  traceRoutes,
  mergeTraces,
  filterTraceBySource,
  formatTraceText,
} from './routeTracer';
import { Route } from '../index';

const sampleRoutes: Route[] = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'DELETE', path: '/users/:id' },
];

describe('createTraceEntry', () => {
  it('creates an entry with correct fields', () => {
    const entry = createTraceEntry(sampleRoutes[0], 'app.ts', 10);
    expect(entry.route).toEqual(sampleRoutes[0]);
    expect(entry.source).toBe('app.ts');
    expect(entry.lineNumber).toBe(10);
    expect(entry.timestamp).toBeDefined();
  });

  it('creates an entry without lineNumber', () => {
    const entry = createTraceEntry(sampleRoutes[1], 'routes.ts');
    expect(entry.lineNumber).toBeUndefined();
  });
});

describe('traceRoutes', () => {
  it('returns correct totalCount', () => {
    const result = traceRoutes(sampleRoutes, 'app.ts');
    expect(result.totalCount).toBe(3);
  });

  it('records the correct source', () => {
    const result = traceRoutes(sampleRoutes, 'server.ts');
    expect(result.sources).toEqual(['server.ts']);
  });

  it('assigns sequential line numbers starting at 1', () => {
    const result = traceRoutes(sampleRoutes, 'app.ts');
    expect(result.entries[0].lineNumber).toBe(1);
    expect(result.entries[2].lineNumber).toBe(3);
  });
});

describe('mergeTraces', () => {
  it('merges entries from multiple traces', () => {
    const t1 = traceRoutes([sampleRoutes[0]], 'a.ts');
    const t2 = traceRoutes([sampleRoutes[1]], 'b.ts');
    const merged = mergeTraces(t1, t2);
    expect(merged.totalCount).toBe(2);
    expect(merged.sources).toContain('a.ts');
    expect(merged.sources).toContain('b.ts');
  });
});

describe('filterTraceBySource', () => {
  it('returns only entries matching source', () => {
    const t1 = traceRoutes([sampleRoutes[0]], 'a.ts');
    const t2 = traceRoutes([sampleRoutes[1], sampleRoutes[2]], 'b.ts');
    const merged = mergeTraces(t1, t2);
    const filtered = filterTraceBySource(merged, 'b.ts');
    expect(filtered).toHaveLength(2);
    expect(filtered.every((e) => e.source === 'b.ts')).toBe(true);
  });
});

describe('formatTraceText', () => {
  it('includes source and route info', () => {
    const result = traceRoutes(sampleRoutes, 'app.ts');
    const text = formatTraceText(result);
    expect(text).toContain('app.ts');
    expect(text).toContain('GET /users');
    expect(text).toContain('DELETE /users/:id');
  });

  it('shows total count in header', () => {
    const result = traceRoutes(sampleRoutes, 'app.ts');
    const text = formatTraceText(result);
    expect(text).toContain('3 route(s)');
  });
});
