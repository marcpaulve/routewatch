import { Route } from '../index';

export interface TagRule {
  tag: string;
  methods?: string[];
  pathPattern?: string | RegExp;
  pathPrefix?: string;
}

export interface TaggedRoute extends Route {
  tags: string[];
}

export function matchesTagRule(route: Route, rule: TagRule): boolean {
  if (rule.methods && rule.methods.length > 0) {
    const normalizedMethods = rule.methods.map((m) => m.toUpperCase());
    if (!normalizedMethods.includes(route.method.toUpperCase())) {
      return false;
    }
  }

  if (rule.pathPrefix) {
    if (!route.path.startsWith(rule.pathPrefix)) {
      return false;
    }
  }

  if (rule.pathPattern) {
    const regex =
      typeof rule.pathPattern === 'string'
        ? new RegExp(rule.pathPattern)
        : rule.pathPattern;
    if (!regex.test(route.path)) {
      return false;
    }
  }

  return true;
}

export function tagRoutes(routes: Route[], rules: TagRule[]): TaggedRoute[] {
  return routes.map((route) => {
    const tags: string[] = [];
    for (const rule of rules) {
      if (matchesTagRule(route, rule)) {
        if (!tags.includes(rule.tag)) {
          tags.push(rule.tag);
        }
      }
    }
    return { ...route, tags };
  });
}

export function groupByTag(
  taggedRoutes: TaggedRoute[]
): Record<string, TaggedRoute[]> {
  const groups: Record<string, TaggedRoute[]> = {};
  for (const route of taggedRoutes) {
    if (route.tags.length === 0) {
      const key = '(untagged)';
      groups[key] = groups[key] ?? [];
      groups[key].push(route);
    }
    for (const tag of route.tags) {
      groups[tag] = groups[tag] ?? [];
      groups[tag].push(route);
    }
  }
  return groups;
}

export function summarizeTags(
  taggedRoutes: TaggedRoute[]
): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const route of taggedRoutes) {
    if (route.tags.length === 0) {
      summary['(untagged)'] = (summary['(untagged)'] ?? 0) + 1;
    }
    for (const tag of route.tags) {
      summary[tag] = (summary[tag] ?? 0) + 1;
    }
  }
  return summary;
}
