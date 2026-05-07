import { Route } from '../index';
import {
  AliasRule,
  AliasedRoute,
  aliasRoutes,
  getAliasedRoutes,
  formatAliasSummary,
} from './routeAliaser';

export { AliasRule, AliasedRoute };

export function applyAliases(
  routes: Route[],
  rules: AliasRule[]
): AliasedRoute[] {
  return aliasRoutes(routes, rules);
}

export function getOnlyAliased(routes: AliasedRoute[]): AliasedRoute[] {
  return getAliasedRoutes(routes);
}

export function printAliasSummary(
  routes: AliasedRoute[],
  rules: AliasRule[]
): void {
  const summary = formatAliasSummary(routes, rules);
  console.log(`\nAlias Summary`);
  console.log(`  Total routes : ${summary.total}`);
  console.log(`  Aliased      : ${summary.aliased}`);
  console.log(`  Unaliased    : ${summary.unaliased}`);
  console.log(`  Rules applied: ${summary.rules.length}`);
  if (summary.aliased > 0) {
    console.log(`\nAliased Routes:`);
    routes
      .filter(r => r.alias)
      .forEach(r =>
        console.log(`  [${r.method}] ${r.originalPath} -> ${r.alias}`)
      );
  }
}
