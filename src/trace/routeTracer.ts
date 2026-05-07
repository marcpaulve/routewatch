import { Route } from '../index';

export interface TraceEntry {
  route: Route;
  timestamp: string;
  source: string;
  lineNumber?: number;
}

export interface TraceResult {
  entries: TraceEntry[];
  totalCount: number;
  sources: string[];
}

export function createTraceEntry(
  route: Route,
  source: string,
  lineNumber?: number
): TraceEntry {
  return {
    route,
    timestamp: new Date().toISOString(),
    source,
    lineNumber,
  };
}

export function traceRoutes(
  routes: Route[],
  source: string
): TraceResult {
  const entries: TraceEntry[] = routes.map((route, index) =>
    createTraceEntry(route, source, index + 1)
  );

  const sources = [...new Set(entries.map((e) => e.source))];

  return {
    entries,
    totalCount: entries.length,
    sources,
  };
}

export function mergeTraces(...traces: TraceResult[]): TraceResult {
  const allEntries = traces.flatMap((t) => t.entries);
  const sources = [...new Set(allEntries.map((e) => e.source))];

  return {
    entries: allEntries,
    totalCount: allEntries.length,
    sources,
  };
}

export function filterTraceBySource(
  trace: TraceResult,
  source: string
): TraceEntry[] {
  return trace.entries.filter((e) => e.source === source);
}

export function formatTraceText(trace: TraceResult): string {
  const lines: string[] = [
    `Trace Report — ${trace.totalCount} route(s) across ${trace.sources.length} source(s)`,
    '',
  ];

  for (const source of trace.sources) {
    const entries = filterTraceBySource(trace, source);
    lines.push(`Source: ${source}`);
    for (const entry of entries) {
      const loc = entry.lineNumber != null ? `:${entry.lineNumber}` : '';
      lines.push(
        `  [${entry.timestamp}] ${entry.route.method.toUpperCase()} ${entry.route.path}${loc}`
      );
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}
