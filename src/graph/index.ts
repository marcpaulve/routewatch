import { Route } from '../index';
import {
  buildRouteGraph,
  flattenGraph,
  findDynamicSegments,
  RouteGraph,
  RouteNode,
} from './routeGraph';

export { RouteGraph, RouteNode };

export function buildGraph(routes: Route[]): RouteGraph {
  return buildRouteGraph(routes);
}

export function getGraphSummary(graph: RouteGraph): string {
  const nodes = flattenGraph(graph.root);
  const dynamicCount = findDynamicSegments(graph).length;
  const staticCount = nodes.filter((n) => !n.isDynamic).length;

  return [
    `Route Graph Summary`,
    `-------------------`,
    `Total nodes  : ${graph.totalNodes}`,
    `Max depth    : ${graph.maxDepth}`,
    `Dynamic segs : ${dynamicCount}`,
    `Static segs  : ${staticCount}`,
  ].join('\n');
}

export function printGraph(routes: Route[]): void {
  const graph = buildGraph(routes);
  console.log(getGraphSummary(graph));
}
