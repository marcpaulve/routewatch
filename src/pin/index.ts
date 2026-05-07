import { Route } from '../index';
import { PinRule, PinnedRoute, pinRoutes, getPinnedRoutes, formatPinSummary } from './routePinner';

export { PinRule, PinnedRoute };

export function applyPins(routes: Route[], rules: PinRule[]): PinnedRoute[] {
  return pinRoutes(routes, rules);
}

export function getOnlyPinned(routes: Route[], rules: PinRule[]): Route[] {
  return getPinnedRoutes(pinRoutes(routes, rules));
}

export function printPinSummary(pinned: PinnedRoute[]): void {
  console.log(formatPinSummary(pinned));
}
