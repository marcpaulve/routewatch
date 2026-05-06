import {
  normalizePath,
  normalizeMethod,
  normalizeRoute,
  normalizeRoutes,
  deduplicateRoutes,
} from './routeNormalizer';
import { Route } from '../index';

const makeRoute = (method: string, path: string): Route => ({ method, path });

describe('normalizePath', () => {
  it('removes trailing slash by default', () => {
    expect(normalizePath('/users/')).toBe('/users');
  });

  it('preserves root slash', () => {
    expect(normalizePath('/')).toBe('/');
  });

  it('adds trailing slash when option set', () => {
    expect(normalizePath('/users', { trailingSlash: 'add' })).toBe('/users/');
  });

  it('collapses multiple slashes', () => {
    expect(normalizePath('/users//profile')).toBe('/users/profile');
  });

  it('prepends leading slash if missing', () => {
    expect(normalizePath('users')).toBe('/users');
  });

  it('preserves trailing slash when option is preserve', () => {
    expect(normalizePath('/users/', { trailingSlash: 'preserve' })).toBe('/users/');
  });
});

describe('normalizeMethod', () => {
  it('uppercases method by default', () => {
    expect(normalizeMethod('get', false)).toBe('GET');
  });

  it('lowercases method when flag is true', () => {
    expect(normalizeMethod('GET', true)).toBe('get');
  });
});

describe('normalizeRoute', () => {
  it('normalizes method and path', () => {
    const result = normalizeRoute(makeRoute('get', '/users/'));
    expect(result.method).toBe('GET');
    expect(result.path).toBe('/users');
  });

  it('respects lowercaseMethods option', () => {
    const result = normalizeRoute(makeRoute('GET', '/users'), { lowercaseMethods: true });
    expect(result.method).toBe('get');
  });
});

describe('normalizeRoutes', () => {
  it('normalizes an array of routes', () => {
    const routes = [makeRoute('get', '/a/'), makeRoute('POST', '//b')];
    const result = normalizeRoutes(routes);
    expect(result[0]).toEqual({ method: 'GET', path: '/a' });
    expect(result[1]).toEqual({ method: 'POST', path: '/b' });
  });
});

describe('deduplicateRoutes', () => {
  it('removes exact duplicates', () => {
    const routes = [makeRoute('GET', '/a'), makeRoute('GET', '/a'), makeRoute('POST', '/a')];
    const { routes: deduped, removed } = deduplicateRoutes(routes);
    expect(deduped).toHaveLength(2);
    expect(removed).toBe(1);
  });

  it('is case-insensitive on method', () => {
    const routes = [makeRoute('GET', '/a'), makeRoute('get', '/a')];
    const { removed } = deduplicateRoutes(routes);
    expect(removed).toBe(1);
  });

  it('returns all routes when no duplicates', () => {
    const routes = [makeRoute('GET', '/a'), makeRoute('POST', '/a')];
    const { removed } = deduplicateRoutes(routes);
    expect(removed).toBe(0);
  });
});
