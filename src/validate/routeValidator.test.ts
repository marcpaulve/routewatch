import {
  isValidMethod,
  isValidPath,
  findDuplicates,
  validateRoutes,
} from './routeValidator';
import type { Route } from '../index';

describe('isValidMethod', () => {
  it('accepts standard HTTP methods', () => {
    expect(isValidMethod('GET')).toBe(true);
    expect(isValidMethod('POST')).toBe(true);
    expect(isValidMethod('PUT')).toBe(true);
    expect(isValidMethod('DELETE')).toBe(true);
    expect(isValidMethod('PATCH')).toBe(true);
  });

  it('accepts lowercase methods', () => {
    expect(isValidMethod('get')).toBe(true);
    expect(isValidMethod('post')).toBe(true);
  });

  it('rejects invalid methods', () => {
    expect(isValidMethod('FETCH')).toBe(false);
    expect(isValidMethod('')).toBe(false);
    expect(isValidMethod('INVALID')).toBe(false);
  });
});

describe('isValidPath', () => {
  it('accepts valid paths', () => {
    expect(isValidPath('/users')).toBe(true);
    expect(isValidPath('/users/:id')).toBe(true);
    expect(isValidPath('/api/v1/resources')).toBe(true);
    expect(isValidPath('/')).toBe(true);
  });

  it('rejects paths not starting with /', () => {
    expect(isValidPath('users')).toBe(false);
    expect(isValidPath('api/v1')).toBe(false);
  });

  it('rejects empty paths', () => {
    expect(isValidPath('')).toBe(false);
  });
});

describe('findDuplicates', () => {
  it('detects duplicate routes', () => {
    const routes: Route[] = [
      { method: 'GET', path: '/users' },
      { method: 'GET', path: '/users' },
      { method: 'POST', path: '/users' },
    ];
    const dupes = findDuplicates(routes);
    expect(dupes).toHaveLength(1);
    expect(dupes[0]).toMatchObject({ method: 'GET', path: '/users' });
  });

  it('returns empty array when no duplicates', () => {
    const routes: Route[] = [
      { method: 'GET', path: '/users' },
      { method: 'POST', path: '/users' },
    ];
    expect(findDuplicates(routes)).toHaveLength(0);
  });
});

describe('validateRoutes', () => {
  it('returns errors for invalid routes', () => {
    const routes: Route[] = [
      { method: 'INVALID', path: '/users' },
      { method: 'GET', path: 'no-slash' },
    ];
    const result = validateRoutes(routes);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('passes valid routes', () => {
    const routes: Route[] = [
      { method: 'GET', path: '/users' },
      { method: 'POST', path: '/users' },
    ];
    const result = validateRoutes(routes);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports duplicate routes as warnings', () => {
    const routes: Route[] = [
      { method: 'GET', path: '/users' },
      { method: 'GET', path: '/users' },
    ];
    const result = validateRoutes(routes);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
