import { Route } from '../index';

export interface AliasRule {
  from: string;
  to: string;
  methods?: string[];
}

export interface AliasedRoute extends Route {
  alias?: string;
  originalPath?: string;
}

export interface AliasSummary {
  total: number;
  aliased: number;
  unaliased: number;
  rules: AliasRule[];
}

export function matchesAliasRule(route: Route, rule: AliasRule): boolean {
  if (route.path !== rule.from) return false;
  if (rule.methods && rule.methods.length > 0) {
    const method = route.method.toUpperCase();
    return rule.methods.map(m => m.toUpperCase()).includes(method);
  }
  return true;
}

export function aliasRoutes(
  routes: Route[],
  rules: AliasRule[]
): AliasedRoute[] {
  return routes.map(route => {
    for (const rule of rules) {
      if (matchesAliasRule(route, rule)) {
        return {
          ...route,
          alias: rule.to,
          originalPath: route.path,
        } as AliasedRoute;
      }
    }
    return { ...route } as AliasedRoute;
  });
}

export function getAliasedRoutes(routes: AliasedRoute[]): AliasedRoute[] {
  return routes.filter(r => r.alias !== undefined);
}

export function formatAliasSummary(
  routes: AliasedRoute[],
  rules: AliasRule[]
): AliasSummary {
  const aliased = routes.filter(r => r.alias !== undefined).length;
  return {
    total: routes.length,
    aliased,
    unaliased: routes.length - aliased,
    rules,
  };
}
