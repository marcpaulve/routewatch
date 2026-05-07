import { Route } from '../index';

export type RouteClass = 'resource' | 'action' | 'webhook' | 'health' | 'auth' | 'static' | 'unknown';

export interface ClassifiedRoute extends Route {
  classification: RouteClass;
  confidence: number;
}

const HEALTH_PATTERNS = [/^\/(health|ping|status|ready|live)(\/?$|\/.*)/i];
const AUTH_PATTERNS = [/^\/(auth|login|logout|signup|register|token|oauth)(\/?$|\/.*)/i];
const WEBHOOK_PATTERNS = [/^\/(webhook|hook|callback|notify)(\/?$|\/.*)/i];
const STATIC_PATTERNS = [/^\/(static|assets|public|media|files)(\/?$|\/.*)/i];
const ACTION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const RESOURCE_PATTERN = /^\/[a-z][a-z0-9-]+(\/:?[a-z][a-z0-9-]*)*(\/?$)/i;

export function classifyRoute(route: Route): ClassifiedRoute {
  const path = route.path.toLowerCase();
  const method = route.method.toUpperCase();

  for (const pattern of HEALTH_PATTERNS) {
    if (pattern.test(path)) {
      return { ...route, classification: 'health', confidence: 0.95 };
    }
  }

  for (const pattern of AUTH_PATTERNS) {
    if (pattern.test(path)) {
      return { ...route, classification: 'auth', confidence: 0.9 };
    }
  }

  for (const pattern of WEBHOOK_PATTERNS) {
    if (pattern.test(path)) {
      return { ...route, classification: 'webhook', confidence: 0.9 };
    }
  }

  for (const pattern of STATIC_PATTERNS) {
    if (pattern.test(path)) {
      return { ...route, classification: 'static', confidence: 0.85 };
    }
  }

  if (RESOURCE_PATTERN.test(route.path) && !ACTION_METHODS.includes(method)) {
    return { ...route, classification: 'resource', confidence: 0.75 };
  }

  if (ACTION_METHODS.includes(method)) {
    return { ...route, classification: 'action', confidence: 0.65 };
  }

  return { ...route, classification: 'unknown', confidence: 0.0 };
}

export function classifyRoutes(routes: Route[]): ClassifiedRoute[] {
  return routes.map(classifyRoute);
}

export function groupByClassification(
  classified: ClassifiedRoute[]
): Record<RouteClass, ClassifiedRoute[]> {
  const groups: Record<RouteClass, ClassifiedRoute[]> = {
    resource: [],
    action: [],
    webhook: [],
    health: [],
    auth: [],
    static: [],
    unknown: [],
  };
  for (const route of classified) {
    groups[route.classification].push(route);
  }
  return groups;
}

export function formatClassificationSummary(
  groups: Record<RouteClass, ClassifiedRoute[]>
): string {
  const lines: string[] = ['Route Classification Summary:', ''];
  for (const [cls, routes] of Object.entries(groups)) {
    if (routes.length > 0) {
      lines.push(`  ${cls.padEnd(10)} ${routes.length} route(s)`);
    }
  }
  return lines.join('\n');
}
