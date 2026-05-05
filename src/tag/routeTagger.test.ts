import { matchesTagRule, tagRoutes, groupByTag, summarizeTags } from './routeTagger';
import { Route } from '../index';

const sampleRoutes: Route[] = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/users/:id' },
  { method: 'DELETE', path: '/users/:id' },
  { method: 'GET', path: '/admin/settings' },
  { method: 'POST', path: '/auth/login' },
  { method: 'GET', path: '/health' },
];

describe('matchesTagRule', () => {
  it('matches by method', () => {
    const rule = { tag: 'read', methods: ['GET'] };
    expect(matchesTagRule({ method: 'GET', path: '/users' }, rule)).toBe(true);
    expect(matchesTagRule({ method: 'POST', path: '/users' }, rule)).toBe(false);
  });

  it('matches by pathPrefix', () => {
    const rule = { tag: 'admin', pathPrefix: '/admin' };
    expect(matchesTagRule({ method: 'GET', path: '/admin/settings' }, rule)).toBe(true);
    expect(matchesTagRule({ method: 'GET', path: '/users' }, rule)).toBe(false);
  });

  it('matches by pathPattern string', () => {
    const rule = { tag: 'dynamic', pathPattern: '/:id$' };
    expect(matchesTagRule({ method: 'GET', path: '/users/:id' }, rule)).toBe(true);
    expect(matchesTagRule({ method: 'GET', path: '/users' }, rule)).toBe(false);
  });

  it('matches by pathPattern RegExp', () => {
    const rule = { tag: 'auth', pathPattern: /^\/auth/ };
    expect(matchesTagRule({ method: 'POST', path: '/auth/login' }, rule)).toBe(true);
    expect(matchesTagRule({ method: 'GET', path: '/users' }, rule)).toBe(false);
  });

  it('combines method and prefix (AND logic)', () => {
    const rule = { tag: 'admin-read', methods: ['GET'], pathPrefix: '/admin' };
    expect(matchesTagRule({ method: 'GET', path: '/admin/settings' }, rule)).toBe(true);
    expect(matchesTagRule({ method: 'POST', path: '/admin/settings' }, rule)).toBe(false);
    expect(matchesTagRule({ method: 'GET', path: '/users' }, rule)).toBe(false);
  });
});

describe('tagRoutes', () => {
  it('applies multiple tags to matching routes', () => {
    const rules = [
      { tag: 'read', methods: ['GET'] },
      { tag: 'user', pathPrefix: '/users' },
    ];
    const tagged = tagRoutes(sampleRoutes, rules);
    const usersGet = tagged.find((r) => r.method === 'GET' && r.path === '/users');
    expect(usersGet?.tags).toContain('read');
    expect(usersGet?.tags).toContain('user');
  });

  it('assigns empty tags array when no rules match', () => {
    const tagged = tagRoutes(sampleRoutes, []);
    expect(tagged.every((r) => r.tags.length === 0)).toBe(true);
  });

  it('does not duplicate tags', () => {
    const rules = [
      { tag: 'read', methods: ['GET'] },
      { tag: 'read', pathPrefix: '/users' },
    ];
    const tagged = tagRoutes([{ method: 'GET', path: '/users' }], rules);
    expect(tagged[0].tags.filter((t) => t === 'read').length).toBe(1);
  });
});

describe('groupByTag', () => {
  it('groups routes by their tags', () => {
    const rules = [{ tag: 'admin', pathPrefix: '/admin' }];
    const tagged = tagRoutes(sampleRoutes, rules);
    const groups = groupByTag(tagged);
    expect(groups['admin']).toHaveLength(1);
    expect(groups['(untagged)']).toHaveLength(sampleRoutes.length - 1);
  });
});

describe('summarizeTags', () => {
  it('counts routes per tag', () => {
    const rules = [{ tag: 'read', methods: ['GET'] }];
    const tagged = tagRoutes(sampleRoutes, rules);
    const summary = summarizeTags(tagged);
    const getCount = sampleRoutes.filter((r) => r.method === 'GET').length;
    expect(summary['read']).toBe(getCount);
  });
});
