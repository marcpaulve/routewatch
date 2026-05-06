import { Route } from '../index';
import {
  DeprecationRule,
  DeprecationResult,
  deprecateRoutes,
  formatDeprecationSummary,
} from './routeDeprecator';

export { DeprecationRule, DeprecationResult } from './routeDeprecator';

export function markDeprecated(routes: Route[], rules: DeprecationRule[]): DeprecationResult {
  return deprecateRoutes(routes, rules);
}

export function getDeprecatedRoutes(routes: Route[], rules: DeprecationRule[]) {
  return deprecateRoutes(routes, rules).deprecated;
}

export function printDeprecationSummary(result: DeprecationResult): void {
  console.log(formatDeprecationSummary(result));
}
