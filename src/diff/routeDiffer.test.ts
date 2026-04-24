import { diffRoutes, hasDifferences } from './routeDiffer';
import { Route } from '../parser/index';

const baseRoutes: Route[] = [
  { method: 'GET', path: '/users', handler: 'getUsers' },
  { method: 'POST', path: '/users', handler: 'createUser' },
  { method: 'DELETE', path: '/users/:id', handler: 'deleteUser' },
];

describe('diffRoutes', () => {
  it('returns no differences when routes are identical', () => {
    const result = diffRoutes(baseRoutes, baseRoutes);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.modified).toHaveLength(0);
    expect(result.unchanged).toHaveLength(3);
  });

  it('detects added routes', () => {
    const current: Route[] = [
      ...baseRoutes,
      { method: 'GET', path: '/posts', handler: 'getPosts' },
    ];
    const result = diffRoutes(baseRoutes, current);
    expect(result.added).toHaveLength(1);
    expect(result.added[0].route.path).toBe('/posts');
  });

  it('detects removed routes', () => {
    const current = baseRoutes.slice(0, 2);
    const result = diffRoutes(baseRoutes, current);
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0].route.path).toBe('/users/:id');
  });

  it('detects modified routes', () => {
    const current: Route[] = [
      { method: 'GET', path: '/users', handler: 'listUsers' },
      ...baseRoutes.slice(1),
    ];
    const result = diffRoutes(baseRoutes, current);
    expect(result.modified).toHaveLength(1);
    expect(result.modified[0].route.handler).toBe('listUsers');
    expect(result.modified[0].previous?.handler).toBe('getUsers');
  });

  it('is case-insensitive for HTTP methods', () => {
    const current: Route[] = [
      { method: 'get', path: '/users', handler: 'getUsers' },
      ...baseRoutes.slice(1),
    ];
    const result = diffRoutes(baseRoutes, current);
    expect(result.unchanged).toHaveLength(3);
  });
});

describe('hasDifferences', () => {
  it('returns false when no differences exist', () => {
    const result = diffRoutes(baseRoutes, baseRoutes);
    expect(hasDifferences(result)).toBe(false);
  });

  it('returns true when differences exist', () => {
    const result = diffRoutes(baseRoutes, []);
    expect(hasDifferences(result)).toBe(true);
  });
});
