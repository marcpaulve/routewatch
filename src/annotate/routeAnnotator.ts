import { Route } from '../index';

export interface Annotation {
  key: string;
  value: string;
}

export interface AnnotatedRoute extends Route {
  annotations: Annotation[];
}

export interface AnnotationRule {
  match: {
    method?: string | string[];
    pathPrefix?: string;
    pathPattern?: RegExp;
  };
  annotations: Annotation[];
}

export function matchesAnnotationRule(route: Route, rule: AnnotationRule): boolean {
  const { match } = rule;

  if (match.method) {
    const methods = Array.isArray(match.method)
      ? match.method.map((m) => m.toUpperCase())
      : [match.method.toUpperCase()];
    if (!methods.includes(route.method.toUpperCase())) return false;
  }

  if (match.pathPrefix) {
    if (!route.path.startsWith(match.pathPrefix)) return false;
  }

  if (match.pathPattern) {
    if (!match.pathPattern.test(route.path)) return false;
  }

  return true;
}

export function annotateRoutes(
  routes: Route[],
  rules: AnnotationRule[]
): AnnotatedRoute[] {
  return routes.map((route) => {
    const collected: Annotation[] = [];

    for (const rule of rules) {
      if (matchesAnnotationRule(route, rule)) {
        collected.push(...rule.annotations);
      }
    }

    // Deduplicate by key — last rule wins
    const deduped = new Map<string, Annotation>();
    for (const ann of collected) {
      deduped.set(ann.key, ann);
    }

    return {
      ...route,
      annotations: Array.from(deduped.values()),
    };
  });
}

export function getAnnotationSummary(
  annotated: AnnotatedRoute[]
): Record<string, string[]> {
  const summary: Record<string, string[]> = {};

  for (const route of annotated) {
    for (const ann of route.annotations) {
      if (!summary[ann.key]) summary[ann.key] = [];
      const label = `${route.method.toUpperCase()} ${route.path}`;
      if (!summary[ann.key].includes(label)) {
        summary[ann.key].push(label);
      }
    }
  }

  return summary;
}
