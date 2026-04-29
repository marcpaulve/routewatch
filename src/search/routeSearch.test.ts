import { searchRoutes, formatSearchResults, SearchResult } from './routeSearch';
import { Route } from '../index';

const sampleRoutes: Route[] = [
  { method: 'GET', path: '/users', handler: 'getUsers' },
  { method: 'POST', path: '/users', handler: 'createUser' },
  { method: 'GET', path: '/users/:id', handler: 'getUserById' },
  { method: 'DELETE', path: '/users/:id', handler: 'deleteUser' },
  { method: 'GET', path: '/products', handler: 'getProducts' },
  { method: 'GET', path: '/health', handler: 'healthCheck' },
];

describe('searchRoutes', () => {
  it('returns all routes with score 0 when query is empty', () => {
    const results = searchRoutes(sampleRoutes, { query: '' });
    expect(results).toHaveLength(sampleRoutes.length);
    results.forEach((r) => expect(r.score).toBe(0));
  });

  it('matches routes by path substring (case-insensitive)', () => {
    const results = searchRoutes(sampleRoutes, { query: 'users' });
    expect(results.length).toBeGreaterThanOrEqual(3);
    results.forEach((r) => expect(r.matchedFields).toContain('path'));
  });

  it('matches routes by method', () => {
    const results = searchRoutes(sampleRoutes, { query: 'GET', fields: ['method'] });
    expect(results.length).toBe(4);
    results.forEach((r) => expect(r.matchedFields).toContain('method'));
  });

  it('matches routes by handler substring', () => {
    const results = searchRoutes(sampleRoutes, { query: 'User', fields: ['handler'] });
    expect(results.length).toBeGreaterThanOrEqual(3);
    results.forEach((r) => expect(r.matchedFields).toContain('handler'));
  });

  it('respects caseSensitive option', () => {
    const insensitive = searchRoutes(sampleRoutes, { query: 'get', fields: ['method'] });
    const sensitive = searchRoutes(sampleRoutes, {
      query: 'get',
      fields: ['method'],
      caseSensitive: true,
    });
    expect(insensitive.length).toBeGreaterThan(0);
    expect(sensitive.length).toBe(0);
  });

  it('respects exact option', () => {
    const partial = searchRoutes(sampleRoutes, { query: '/users', fields: ['path'] });
    const exact = searchRoutes(sampleRoutes, { query: '/users', fields: ['path'], exact: true });
    expect(partial.length).toBeGreaterThan(exact.length);
    exact.forEach((r) => expect(r.route.path).toBe('/users'));
  });

  it('sorts results by score descending', () => {
    const results = searchRoutes(sampleRoutes, { query: 'users' });
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });
});

describe('formatSearchResults', () => {
  it('returns no-match message for empty results', () => {
    const output = formatSearchResults([]);
    expect(output).toContain('No routes matched');
  });

  it('formats results with matched fields', () => {
    const results: SearchResult[] = [
      { route: { method: 'GET', path: '/users', handler: 'getUsers' }, matchedFields: ['path'], score: 2 },
    ];
    const output = formatSearchResults(results);
    expect(output).toContain('/users');
    expect(output).toContain('GET');
    expect(output).toContain('matched: path');
  });

  it('includes count in header', () => {
    const results: SearchResult[] = [
      { route: { method: 'GET', path: '/health' }, matchedFields: ['path'], score: 2 },
    ];
    const output = formatSearchResults(results);
    expect(output).toContain('1 matching route');
  });
});
