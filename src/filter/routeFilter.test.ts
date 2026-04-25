import {
  filterByMethod,
  filterByPathPrefix,
  filterByPathPattern,
  applyFilters,
  normalizeMethod,
} from './routeFilter';
import { Route } from '../parser/index';

const sampleRoutes: Route[] = [
  { method: 'GET', path: '/api/users', handler: 'getUsers' },
  { method: 'POST', path: '/api/users', handler: 'createUser' },
  { method: 'GET', path: '/api/orders', handler: 'getOrders' },
  { method: 'DELETE', path: '/api/users/:id', handler: 'deleteUser' },
  { method: 'get', path: '/health', handler: 'healthCheck' },
];

describe('normalizeMethod', () => {
  it('converts lowercase to uppercase', () => {
    expect(normalizeMethod('get')).toBe('GET');
    expect(normalizeMethod('post')).toBe('POST');
  });

  it('leaves uppercase unchanged', () => {
    expect(normalizeMethod('DELETE')).toBe('DELETE');
  });
});

describe('filterByMethod', () => {
  it('returns only routes matching the given methods', () => {
    const result = filterByMethod(sampleRoutes, ['GET']);
    expect(result).toHaveLength(3);
    result.forEach((r) => expect(r.method.toUpperCase()).toBe('GET'));
  });

  it('supports multiple methods', () => {
    const result = filterByMethod(sampleRoutes, ['GET', 'POST']);
    expect(result).toHaveLength(4);
  });

  it('returns empty array when no match', () => {
    const result = filterByMethod(sampleRoutes, ['PATCH']);
    expect(result).toHaveLength(0);
  });
});

describe('filterByPathPrefix', () => {
  it('returns routes starting with the prefix', () => {
    const result = filterByPathPrefix(sampleRoutes, '/api');
    expect(result).toHaveLength(4);
  });

  it('returns only exact prefix matches', () => {
    const result = filterByPathPrefix(sampleRoutes, '/api/users');
    expect(result).toHaveLength(3);
  });
});

describe('filterByPathPattern', () => {
  it('returns routes matching the regex', () => {
    const result = filterByPathPattern(sampleRoutes, /\/api\/users/);
    expect(result).toHaveLength(3);
  });

  it('returns empty array when no match', () => {
    const result = filterByPathPattern(sampleRoutes, /\/admin/);
    expect(result).toHaveLength(0);
  });
});

describe('applyFilters', () => {
  it('applies method and prefix filters together', () => {
    const result = applyFilters(sampleRoutes, {
      methods: ['GET'],
      pathPrefix: '/api/users',
    });
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('/api/users');
  });

  it('returns all routes when no filters provided', () => {
    const result = applyFilters(sampleRoutes, {});
    expect(result).toHaveLength(sampleRoutes.length);
  });

  it('applies pattern filter', () => {
    const result = applyFilters(sampleRoutes, { pathPattern: /\/health/ });
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('/health');
  });
});
