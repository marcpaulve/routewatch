import { Route } from '../index';
import { computeRouteStats, RouteStats } from './routeStats';
import { formatStatsText, formatStatsJson, formatStatsMarkdown } from './statsFormatter';

export type StatsFormat = 'text' | 'json' | 'markdown';

export { RouteStats, computeRouteStats };
export { formatStatsText, formatStatsJson, formatStatsMarkdown };

export function getStats(routes: Route[]): RouteStats {
  return computeRouteStats(routes);
}

export function formatStats(
  stats: RouteStats,
  format: StatsFormat = 'text'
): string {
  switch (format) {
    case 'json':
      return formatStatsJson(stats);
    case 'markdown':
      return formatStatsMarkdown(stats);
    case 'text':
    default:
      return formatStatsText(stats);
  }
}

export function printStats(routes: Route[], format: StatsFormat = 'text'): void {
  const stats = getStats(routes);
  console.log(formatStats(stats, format));
}
