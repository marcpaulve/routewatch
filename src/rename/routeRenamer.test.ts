import { renameRoutes, applyRenames, matchesRule } from './routeRenamer';
import { Route } from '../index';

const sampleRoutes: Route[] = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/users/:id' },
  { method: 'DELETE', path: '/users/:id' },
  { method: 'GET', path: '/posts' },
];

describe('matchesRule', () => {
  it('matches route by path only', () => {
    const rule = { fromPath: '/users', toPath: '/members' };
    expect(matchesRule({ method: 'GET', path: '/users' }, rule)).toBe(true);
    expect(matchesRule({ method: 'POST', path: '/users' }, rule)).toBe(true);
  });

  it('matches route by path and method', () => {
    const rule = { fromPath: '/users', toPath: '/members', method: 'GET' };
    expect(matchesRule({ method: 'GET', path: '/users' }, rule)).toBe(true);
    expect(matchesRule({ method: 'POST', path: '/users' }, rule)).toBe(false);
  });

  it('is case-insensitive for method', () => {
    const rule = { fromPath: '/users', toPath: '/members', method: 'get' };
    expect(matchesRule({ method: 'GET', path: '/users' }, rule)).toBe(true);
  });

  it('does not match different path', () => {
    const rule = { fromPath: '/users', toPath: '/members' };
    expect(matchesRule({ method: 'GET', path: '/posts' }, rule)).toBe(false);
  });
});

describe('renameRoutes', () => {
  it('renames all matching routes', () => {
    const rules = [{ fromPath: '/users', toPath: '/members' }];
    const summary = renameRoutes(sampleRoutes, rules);
    expect(summary.totalRenamed).toBe(2);
    expect(summary.renamed[0].renamed.path).toBe('/members');
    expect(summary.renamed[1].renamed.path).toBe('/members');
  });

  it('preserves method when renaming', () => {
    const rules = [{ fromPath: '/users', toPath: '/members' }];
    const summary = renameRoutes(sampleRoutes, rules);
    expect(summary.renamed[0].renamed.method).toBe('GET');
    expect(summary.renamed[1].renamed.method).toBe('POST');
  });

  it('leaves unmatched routes unchanged', () => {
    const rules = [{ fromPath: '/users', toPath: '/members' }];
    const summary = renameRoutes(sampleRoutes, rules);
    expect(summary.unchanged).toHaveLength(3);
  });

  it('handles no matching rules', () => {
    const rules = [{ fromPath: '/nonexistent', toPath: '/other' }];
    const summary = renameRoutes(sampleRoutes, rules);
    expect(summary.totalRenamed).toBe(0);
    expect(summary.unchanged).toHaveLength(sampleRoutes.length);
  });

  it('returns correct totals', () => {
    const rules = [{ fromPath: '/posts', toPath: '/articles' }];
    const summary = renameRoutes(sampleRoutes, rules);
    expect(summary.totalRoutes).toBe(5);
    expect(summary.totalRenamed).toBe(1);
  });
});

describe('applyRenames', () => {
  it('merges renamed and unchanged routes', () => {
    const rules = [{ fromPath: '/users', toPath: '/members' }];
    const summary = renameRoutes(sampleRoutes, rules);
    const result = applyRenames(summary);
    expect(result).toHaveLength(sampleRoutes.length);
    expect(result.some((r) => r.path === '/members')).toBe(true);
    expect(result.some((r) => r.path === '/users')).toBe(false);
  });
});
