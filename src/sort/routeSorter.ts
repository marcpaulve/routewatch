import { Route } from '../parser';

export type SortField = 'method' | 'path' | 'depth';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  order?: SortOrder;
}

function getPathDepth(path: string): number {
  return path.split('/').filter(Boolean).length;
}

function methodOrder(method: string): number {
  const order: Record<string, number> = {
    GET: 0,
    POST: 1,
    PUT: 2,
    PATCH: 3,
    DELETE: 4,
    HEAD: 5,
    OPTIONS: 6,
  };
  return order[method.toUpperCase()] ?? 99;
}

export function sortByMethod(routes: Route[], order: SortOrder = 'asc'): Route[] {
  return [...routes].sort((a, b) => {
    const diff = methodOrder(a.method) - methodOrder(b.method);
    return order === 'asc' ? diff : -diff;
  });
}

export function sortByPath(routes: Route[], order: SortOrder = 'asc'): Route[] {
  return [...routes].sort((a, b) => {
    const diff = a.path.localeCompare(b.path);
    return order === 'asc' ? diff : -diff;
  });
}

export function sortByDepth(routes: Route[], order: SortOrder = 'asc'): Route[] {
  return [...routes].sort((a, b) => {
    const diff = getPathDepth(a.path) - getPathDepth(b.path);
    return order === 'asc' ? diff : -diff;
  });
}

export function sortRoutes(routes: Route[], options: SortOptions): Route[] {
  const { field, order = 'asc' } = options;
  switch (field) {
    case 'method':
      return sortByMethod(routes, order);
    case 'path':
      return sortByPath(routes, order);
    case 'depth':
      return sortByDepth(routes, order);
    default:
      return routes;
  }
}
