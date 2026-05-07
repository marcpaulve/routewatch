import { Route } from '../index';
import {
  TraceResult,
  traceRoutes,
  mergeTraces,
  formatTraceText,
} from './routeTracer';

export { TraceEntry, TraceResult } from './routeTracer';

export function traceRouteList(
  routes: Route[],
  source: string
): TraceResult {
  return traceRoutes(routes, source);
}

export function combineTraces(...traces: TraceResult[]): TraceResult {
  return mergeTraces(...traces);
}

export function printTraceSummary(trace: TraceResult): void {
  console.log(formatTraceText(trace));
}

export function getTraceBySource(
  trace: TraceResult,
  source: string
): TraceResult {
  const filtered = trace.entries.filter((e) => e.source === source);
  return {
    entries: filtered,
    totalCount: filtered.length,
    sources: filtered.length > 0 ? [source] : [],
  };
}
