import { Route } from '../index';

export interface SearchOptions {
  query: string;
  fields?: Array<'method' | 'path' | 'handler'>;
  caseSensitive?: boolean;
  exact?: boolean;
}

export interface SearchResult {
  route: Route;
  matchedFields: string[];
  score: number;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesQuery(
  value: string,
  query: string,
  caseSensitive: boolean,
  exact: boolean
): boolean {
  const flags = caseSensitive ? '' : 'i';
  const pattern = exact
    ? `^${escapeRegex(query)}$`
    : escapeRegex(query);
  return new RegExp(pattern, flags).test(value);
}

export function searchRoutes(
  routes: Route[],
  options: SearchOptions
): SearchResult[] {
  const {
    query,
    fields = ['method', 'path', 'handler'],
    caseSensitive = false,
    exact = false,
  } = options;

  if (!query || query.trim() === '') {
    return routes.map((route) => ({ route, matchedFields: [], score: 0 }));
  }

  const results: SearchResult[] = [];

  for (const route of routes) {
    const matchedFields: string[] = [];
    let score = 0;

    if (fields.includes('method') && route.method) {
      if (matchesQuery(route.method, query, caseSensitive, exact)) {
        matchedFields.push('method');
        score += 1;
      }
    }

    if (fields.includes('path') && route.path) {
      if (matchesQuery(route.path, query, caseSensitive, exact)) {
        matchedFields.push('path');
        score += 2;
      }
    }

    if (fields.includes('handler') && route.handler) {
      if (matchesQuery(route.handler, query, caseSensitive, exact)) {
        matchedFields.push('handler');
        score += 1;
      }
    }

    if (matchedFields.length > 0) {
      results.push({ route, matchedFields, score });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No routes matched the search query.';
  }
  const lines = [`Found ${results.length} matching route(s):\n`];
  for (const { route, matchedFields } of results) {
    const handler = route.handler ? ` → ${route.handler}` : '';
    lines.push(
      `  [${route.method}] ${route.path}${handler}  (matched: ${matchedFields.join(', ')})`
    );
  }
  return lines.join('\n');
}
