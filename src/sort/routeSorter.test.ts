import { sortRoutes, sortByMethod, sortByPath, sortByDepth } from './routeSorter';
import { Route } from '../parser';

const routes: Route[] = [
  { method: 'DELETE', path: '/users/:id' },
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/api/v1/products/:id/reviews' },
  { method: 'PATCH', path: '/users/:id' },
  { method: 'GET', path: '/health' },
];

describe('sortByMethod', () => {
  it('sorts routes by HTTP method in default (asc) order', () => {
    const sorted = sortByMethod(routes);
    const methods = sorted.map((r) => r.method);
    expect(methods.indexOf('GET')).toBeLessThan(methods.indexOf('POST'));
    expect(methods.indexOf('POST')).toBeLessThan(methods.indexOf('PATCH'));
    expect(methods.indexOf('PATCH')).toBeLessThan(methods.indexOf('DELETE'));
  });

  it('sorts routes by HTTP method in desc order', () => {
    const sorted = sortByMethod(routes, 'desc');
    const methods = sorted.map((r) => r.method);
    expect(methods.indexOf('DELETE')).toBeLessThan(methods.indexOf('GET'));
  });

  it('does not mutate the original array', () => {
    const original = [...routes];
    sortByMethod(routes);
    expect(routes).toEqual(original);
  });
});

describe('sortByPath', () => {
  it('sorts routes alphabetically by path asc', () => {
    const sorted = sortByPath(routes);
    const paths = sorted.map((r) => r.path);
    expect(paths[0]).toBe('/api/v1/products/:id/reviews');
    expect(paths[paths.length - 1]).toBe('/users/:id');
  });

  it('sorts routes alphabetically by path desc', () => {
    const sorted = sortByPath(routes, 'desc');
    expect(sorted[0].path).toBe('/users/:id');
  });
});

describe('sortByDepth', () => {
  it('sorts routes by path depth asc', () => {
    const sorted = sortByDepth(routes);
    const first = sorted[0];
    expect(first.path.split('/').filter(Boolean).length).toBeLessThanOrEqual(1);
  });

  it('sorts routes by path depth desc', () => {
    const sorted = sortByDepth(routes, 'desc');
    const deepest = sorted[0];
    expect(deepest.path).toBe('/api/v1/products/:id/reviews');
  });
});

describe('sortRoutes', () => {
  it('delegates to sortByMethod when field is method', () => {
    const result = sortRoutes(routes, { field: 'method' });
    expect(result[0].method).toBe('GET');
  });

  it('delegates to sortByPath when field is path', () => {
    const result = sortRoutes(routes, { field: 'path', order: 'asc' });
    expect(result[0].path).toBe('/api/v1/products/:id/reviews');
  });

  it('delegates to sortByDepth when field is depth', () => {
    const result = sortRoutes(routes, { field: 'depth', order: 'desc' });
    expect(result[0].path).toBe('/api/v1/products/:id/reviews');
  });

  it('returns routes unchanged for unknown field', () => {
    const result = sortRoutes(routes, { field: 'unknown' as any });
    expect(result).toEqual(routes);
  });
});
