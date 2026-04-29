import { Route } from '../index';

export interface RouteNode {
  segment: string;
  fullPath: string;
  methods: string[];
  children: Map<string, RouteNode>;
  isDynamic: boolean;
}

export interface RouteGraph {
  root: RouteNode;
  totalNodes: number;
  maxDepth: number;
}

function createNode(segment: string, fullPath: string): RouteNode {
  return {
    segment,
    fullPath,
    methods: [],
    children: new Map(),
    isDynamic: segment.startsWith(':') || segment.startsWith('{'),
  };
}

export function buildRouteGraph(routes: Route[]): RouteGraph {
  const root = createNode('/', '/');
  let totalNodes = 1;
  let maxDepth = 0;

  for (const route of routes) {
    const segments = route.path.split('/').filter(Boolean);
    let current = root;
    let depth = 0;

    for (const segment of segments) {
      depth++;
      if (!current.children.has(segment)) {
        const fullPath = '/' + segments.slice(0, depth).join('/');
        current.children.set(segment, createNode(segment, fullPath));
        totalNodes++;
      }
      current = current.children.get(segment)!;
    }

    if (!current.methods.includes(route.method)) {
      current.methods.push(route.method);
    }

    if (depth > maxDepth) maxDepth = depth;
  }

  return { root, totalNodes, maxDepth };
}

export function flattenGraph(node: RouteNode, result: RouteNode[] = []): RouteNode[] {
  if (node.methods.length > 0 || node.fullPath !== '/') {
    result.push(node);
  }
  for (const child of node.children.values()) {
    flattenGraph(child, result);
  }
  return result;
}

export function findDynamicSegments(graph: RouteGraph): RouteNode[] {
  return flattenGraph(graph.root).filter((node) => node.isDynamic);
}
