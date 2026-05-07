import { Route } from '../index';
import {
  PriorityRule,
  PrioritizedRoute,
  prioritizeRoutes,
  sortByPriority,
  formatPrioritySummary,
} from './routePrioritizer';

export { PriorityRule, PrioritizedRoute };

export function applyPriorities(
  routes: Route[],
  rules: PriorityRule[]
): PrioritizedRoute[] {
  return prioritizeRoutes(routes, rules);
}

export function getTopPriorityRoutes(
  routes: Route[],
  rules: PriorityRule[],
  topN: number = 10
): PrioritizedRoute[] {
  const prioritized = prioritizeRoutes(routes, rules);
  return sortByPriority(prioritized).slice(0, topN);
}

export function printPrioritySummary(
  routes: Route[],
  rules: PriorityRule[]
): void {
  const prioritized = prioritizeRoutes(routes, rules);
  console.log(formatPrioritySummary(prioritized));
}
