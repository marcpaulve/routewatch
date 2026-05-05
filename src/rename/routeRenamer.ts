import { Route } from '../index';

export interface RenameRule {
  fromPath: string;
  toPath: string;
  method?: string;
}

export interface RenameResult {
  original: Route;
  renamed: Route;
  rule: RenameRule;
}

export interface RenameSummary {
  renamed: RenameResult[];
  unchanged: Route[];
  totalRoutes: number;
  totalRenamed: number;
}

export function matchesRule(route: Route, rule: RenameRule): boolean {
  const pathMatches = route.path === rule.fromPath;
  const methodMatches = rule.method
    ? route.method.toUpperCase() === rule.method.toUpperCase()
    : true;
  return pathMatches && methodMatches;
}

export function applyRenameRule(route: Route, rule: RenameRule): Route {
  return { ...route, path: rule.toPath };
}

export function renameRoutes(
  routes: Route[],
  rules: RenameRule[]
): RenameSummary {
  const renamed: RenameResult[] = [];
  const unchanged: Route[] = [];

  for (const route of routes) {
    const matchingRule = rules.find((rule) => matchesRule(route, rule));
    if (matchingRule) {
      renamed.push({
        original: route,
        renamed: applyRenameRule(route, matchingRule),
        rule: matchingRule,
      });
    } else {
      unchanged.push(route);
    }
  }

  return {
    renamed,
    unchanged,
    totalRoutes: routes.length,
    totalRenamed: renamed.length,
  };
}

export function applyRenames(summary: RenameSummary): Route[] {
  return [
    ...summary.renamed.map((r) => r.renamed),
    ...summary.unchanged,
  ];
}
