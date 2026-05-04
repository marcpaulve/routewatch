import { sortByMethod, sortByPath, sortByDepth, sortRoutes } from './routeSorter';
import { Route } from '../index';

const routes: Route[] = [
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/users/:id/profile' },
  { method: 'DELETE', path: '/users/:id' },
  { method: 'GET', path: '/health' },
  { method: 'PUT', path: '/users/:id' },
  { method: 'GET', path: '/users' },
];

describe('sortByMethod', () => {
  it('sorts routes by HTTP method in default order', () => {
    const result = sortByMethod([...routes]);
    const methods = result.map((r) => r.method);
    expect(methods.indexOf('GET')).toBeLessThan(methods.indexOf('POST'));
    expect(methods.indexOf('POST')).toBeLessThan(methods.indexOf('PUT'));
    expect(methods.indexOf('PUT')).toBeLessThan(methods.indexOf('DELETE'));
  });

  it('sorts routes by HTTP method in descending order', () => {
    const result = sortByMethod([...routes], 'desc');
    const methods = result.map((r) => r.method);
    expect(methods.indexOf('DELETE')).toBeLessThan(methods.indexOf('GET'));
  });
});

describe('sortByPath', () => {
  it('sorts routes alphabetically by path ascending', () => {
    const result = sortByPath([...routes]);
    const paths = result.map((r) => r.path);
    expect(paths[0]).toBe('/health');
    expect(paths[paths.length - 1]).toBe('/users/:id/profile');
  });

  it('sorts routes alphabetically by path descending', () => {
    const result = sortByPath([...routes], 'desc');
    const paths = result.map((r) => r.path);
    expect(paths[0]).toBe('/users/:id/profile');
  });
});

describe('sortByDepth', () => {
  it('sorts routes by path depth ascending', () => {
    const result = sortByDepth([...routes]);
    const depths = result.map((r) => r.path.split('/').filter(Boolean).length);
    for (let i = 1; i < depths.length; i++) {
      expect(depths[i]).toBeGreaterThanOrEqual(depths[i - 1]);
    }
  });

  it('sorts routes by path depth descending', () => {
    const result = sortByDepth([...routes], 'desc');
    expect(result[0].path).toBe('/users/:id/profile');
  });
});

describe('sortRoutes', () => {
  it('delegates to sortByPath by default', () => {
    const byPath = sortByPath([...routes]);
    const result = sortRoutes([...routes], 'path', 'asc');
    expect(result.map((r) => r.path)).toEqual(byPath.map((r) => r.path));
  });

  it('delegates to sortByMethod', () => {
    const byMethod = sortByMethod([...routes]);
    const result = sortRoutes([...routes], 'method', 'asc');
    expect(result.map((r) => r.method)).toEqual(byMethod.map((r) => r.method));
  });

  it('delegates to sortByDepth', () => {
    const byDepth = sortByDepth([...routes]);
    const result = sortRoutes([...routes], 'depth', 'asc');
    expect(result.map((r) => r.path)).toEqual(byDepth.map((r) => r.path));
  });

  it('falls back to sortByPath for unknown field', () => {
    const byPath = sortByPath([...routes]);
    const result = sortRoutes([...routes], 'unknown' as any, 'asc');
    expect(result.map((r) => r.path)).toEqual(byPath.map((r) => r.path));
  });
});
