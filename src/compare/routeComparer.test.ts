import { compareRoutes, normalizePath, normalizeRoute } from './routeComparer';
import { Route } from '../parser';

const makeRoute = (method: string, path: string, extra?: Partial<Route>): Route => ({
  method,
  path,
  ...extra,
});

describe('normalizePath', () => {
  it('removes trailing slashes', () => {
    expect(normalizePath('/api/users/')).toBe('/api/users');
  });

  it('collapses double slashes', () => {
    expect(normalizePath('/api//users')).toBe('/api/users');
  });

  it('returns / for empty path', () => {
    expect(normalizePath('')).toBe('/');
  });
});

describe('normalizeRoute', () => {
  it('normalizes path when option is set', () => {
    const route = makeRoute('GET', '/api/users/');
    const result = normalizeRoute(route, { normalizePaths: true });
    expect(result.path).toBe('/api/users');
  });

  it('strips query params when option is set', () => {
    const route = makeRoute('GET', '/api/users?page=1');
    const result = normalizeRoute(route, { ignoreQueryParams: true });
    expect(result.path).toBe('/api/users');
  });

  it('does not modify route when no options set', () => {
    const route = makeRoute('GET', '/api/users/');
    const result = normalizeRoute(route, {});
    expect(result.path).toBe('/api/users/');
  });
});

describe('compareRoutes', () => {
  const base: Route[] = [
    makeRoute('GET', '/users'),
    makeRoute('POST', '/users'),
    makeRoute('DELETE', '/users/:id'),
  ];

  const head: Route[] = [
    makeRoute('GET', '/users'),
    makeRoute('POST', '/users'),
    makeRoute('GET', '/posts'),
  ];

  it('returns correct counts', () => {
    const result = compareRoutes(base, head);
    expect(result.baseCount).toBe(3);
    expect(result.headCount).toBe(3);
    expect(result.addedCount).toBe(1);
    expect(result.removedCount).toBe(1);
    expect(result.unchangedCount).toBe(2);
  });

  it('applies filter options', () => {
    const result = compareRoutes(base, head, { filter: { methods: ['GET'] } });
    expect(result.baseCount).toBe(1);
    expect(result.headCount).toBe(2);
  });

  it('normalizes paths before comparing', () => {
    const b = [makeRoute('GET', '/users/')];
    const h = [makeRoute('GET', '/users')];
    const result = compareRoutes(b, h, { normalizePaths: true });
    expect(result.unchangedCount).toBe(1);
    expect(result.addedCount).toBe(0);
    expect(result.removedCount).toBe(0);
  });
});
