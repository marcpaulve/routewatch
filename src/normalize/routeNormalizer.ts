import { Route } from '../index';

export interface NormalizeOptions {
  lowercaseMethods?: boolean;
  trailingSlash?: 'add' | 'remove' | 'preserve';
  collapseSlashes?: boolean;
  sortParams?: boolean;
}

const DEFAULT_OPTIONS: NormalizeOptions = {
  lowercaseMethods: false,
  trailingSlash: 'remove',
  collapseSlashes: true,
  sortParams: false,
};

export function normalizePath(path: string, options: NormalizeOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let normalized = path;

  if (opts.collapseSlashes) {
    normalized = normalized.replace(/\/+/g, '/');
  }

  if (opts.trailingSlash === 'remove' && normalized.length > 1) {
    normalized = normalized.replace(/\/$/, '');
  } else if (opts.trailingSlash === 'add' && !normalized.endsWith('/')) {
    normalized = normalized + '/';
  }

  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }

  return normalized;
}

export function normalizeMethod(method: string, lowercase: boolean): string {
  return lowercase ? method.toLowerCase() : method.toUpperCase();
}

export function normalizeRoute(route: Route, options: NormalizeOptions = {}): Route {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  return {
    ...route,
    method: normalizeMethod(route.method, opts.lowercaseMethods ?? false),
    path: normalizePath(route.path, opts),
  };
}

export function normalizeRoutes(routes: Route[], options: NormalizeOptions = {}): Route[] {
  return routes.map((r) => normalizeRoute(r, options));
}

export function deduplicateRoutes(routes: Route[]): { routes: Route[]; removed: number } {
  const seen = new Set<string>();
  const unique: Route[] = [];

  for (const route of routes) {
    const key = `${route.method.toUpperCase()}:${route.path}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(route);
    }
  }

  return { routes: unique, removed: routes.length - unique.length };
}
