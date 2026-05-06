import { Route } from '../index';

export interface MockRoute {
  method: string;
  path: string;
  statusCode: number;
  responseBody: unknown;
  headers?: Record<string, string>;
}

export interface MockConfig {
  defaultStatusCode?: number;
  defaultBody?: unknown;
  statusOverrides?: Record<string, number>;
}

const DEFAULT_STATUS = 200;
const DEFAULT_BODY = { message: 'ok' };

export function inferStatusCode(method: string, overrides?: Record<string, number>): number {
  const key = method.toUpperCase();
  if (overrides && key in overrides) return overrides[key];
  if (key === 'POST') return 201;
  if (key === 'DELETE') return 204;
  return DEFAULT_STATUS;
}

export function generateMockBody(route: Route, defaultBody?: unknown): unknown {
  if (defaultBody !== undefined) return defaultBody;
  const segments = route.path.split('/').filter(Boolean);
  const resource = segments.find(s => !s.startsWith(':')) ?? 'resource';
  if (route.method.toUpperCase() === 'DELETE') return null;
  if (route.method.toUpperCase() === 'GET' && !route.path.includes(':')) {
    return [{ id: 1, name: `example-${resource}` }];
  }
  return { id: 1, name: `example-${resource}` };
}

export function mockRoutes(routes: Route[], config: MockConfig = {}): MockRoute[] {
  return routes.map(route => ({
    method: route.method.toUpperCase(),
    path: route.path,
    statusCode: inferStatusCode(route.method, config.statusOverrides) ?? config.defaultStatusCode ?? DEFAULT_STATUS,
    responseBody: generateMockBody(route, config.defaultBody),
    headers: { 'Content-Type': 'application/json' },
  }));
}

export function formatMockAsExpressHandler(mock: MockRoute): string {
  const body = JSON.stringify(mock.responseBody);
  const method = mock.method.toLowerCase();
  return `app.${method}('${mock.path}', (req, res) => res.status(${mock.statusCode}).json(${body}));`;
}

export function exportMocksAsExpressApp(mocks: MockRoute[]): string {
  const handlers = mocks.map(formatMockAsExpressHandler).join('\n');
  return `const express = require('express');
const app = express();
app.use(express.json());

${handlers}

app.listen(3000, () => console.log('Mock server running on port 3000'));
`;
}
