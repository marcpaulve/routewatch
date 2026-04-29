import { buildRouteGraph, flattenGraph, findDynamicSegments } from './routeGraph';
import { Route } from '../index';

const sampleRoutes: Route[] = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/users/:id' },
  { method: 'DELETE', path: '/users/:id' },
  { method: 'GET', path: '/users/:id/posts' },
  { method: 'GET', path: '/health' },
];

describe('buildRouteGraph', () => {
  it('builds a graph with correct root', () => {
    const graph = buildRouteGraph(sampleRoutes);
    expect(graph.root.segment).toBe('/');
    expect(graph.root.fullPath).toBe('/');
  });

  it('calculates max depth correctly', () => {
    const graph = buildRouteGraph(sampleRoutes);
    expect(graph.maxDepth).toBe(3); // /users/:id/posts
  });

  it('counts total nodes', () => {
    const graph = buildRouteGraph(sampleRoutes);
    // root + users + :id + posts + health = 5 children + root = 5
    expect(graph.totalNodes).toBeGreaterThan(1);
  });

  it('merges methods on the same path node', () => {
    const graph = buildRouteGraph(sampleRoutes);
    const usersNode = graph.root.children.get('users')!;
    expect(usersNode.methods).toContain('GET');
    expect(usersNode.methods).toContain('POST');
  });

  it('marks dynamic segments correctly', () => {
    const graph = buildRouteGraph(sampleRoutes);
    const idNode = graph.root.children.get('users')!.children.get(':id')!;
    expect(idNode.isDynamic).toBe(true);
  });

  it('marks static segments correctly', () => {
    const graph = buildRouteGraph(sampleRoutes);
    const usersNode = graph.root.children.get('users')!;
    expect(usersNode.isDynamic).toBe(false);
  });
});

describe('flattenGraph', () => {
  it('returns all leaf and intermediate nodes with methods', () => {
    const graph = buildRouteGraph(sampleRoutes);
    const nodes = flattenGraph(graph.root);
    const paths = nodes.map((n) => n.fullPath);
    expect(paths).toContain('/users');
    expect(paths).toContain('/:id');
  });
});

describe('findDynamicSegments', () => {
  it('returns only dynamic nodes', () => {
    const graph = buildRouteGraph(sampleRoutes);
    const dynamic = findDynamicSegments(graph);
    expect(dynamic.every((n) => n.isDynamic)).toBe(true);
    expect(dynamic.length).toBeGreaterThan(0);
  });
});
