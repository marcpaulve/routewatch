import { inferStatusCode, generateMockBody, mockRoutes, formatMockAsExpressHandler, exportMocksAsExpressApp } from './routeMocker';
import { Route } from '../index';

const routes: Route[] = [
  { method: 'GET', path: '/users' },
  { method: 'GET', path: '/users/:id' },
  { method: 'POST', path: '/users' },
  { method: 'DELETE', path: '/users/:id' },
  { method: 'PUT', path: '/users/:id' },
];

describe('inferStatusCode', () => {
  it('returns 200 for GET', () => expect(inferStatusCode('GET')).toBe(200));
  it('returns 201 for POST', () => expect(inferStatusCode('POST')).toBe(201));
  it('returns 204 for DELETE', () => expect(inferStatusCode('DELETE')).toBe(204));
  it('respects statusOverrides', () => {
    expect(inferStatusCode('POST', { POST: 202 })).toBe(202);
  });
});

describe('generateMockBody', () => {
  it('returns array for GET collection route', () => {
    const body = generateMockBody({ method: 'GET', path: '/users' });
    expect(Array.isArray(body)).toBe(true);
  });
  it('returns object for GET item route', () => {
    const body = generateMockBody({ method: 'GET', path: '/users/:id' });
    expect(typeof body).toBe('object');
    expect(Array.isArray(body)).toBe(false);
  });
  it('returns null for DELETE', () => {
    const body = generateMockBody({ method: 'DELETE', path: '/users/:id' });
    expect(body).toBeNull();
  });
  it('uses defaultBody when provided', () => {
    const body = generateMockBody({ method: 'GET', path: '/users' }, { custom: true });
    expect(body).toEqual({ custom: true });
  });
});

describe('mockRoutes', () => {
  it('returns a mock for each route', () => {
    const mocks = mockRoutes(routes);
    expect(mocks).toHaveLength(routes.length);
  });
  it('sets correct status codes', () => {
    const mocks = mockRoutes(routes);
    expect(mocks.find(m => m.method === 'POST')?.statusCode).toBe(201);
    expect(mocks.find(m => m.method === 'DELETE')?.statusCode).toBe(204);
  });
  it('includes Content-Type header', () => {
    const mocks = mockRoutes(routes);
    expect(mocks[0].headers?.['Content-Type']).toBe('application/json');
  });
});

describe('formatMockAsExpressHandler', () => {
  it('generates a valid express handler string', () => {
    const mock = { method: 'GET', path: '/users', statusCode: 200, responseBody: [] };
    const handler = formatMockAsExpressHandler(mock);
    expect(handler).toContain("app.get('/users'");
    expect(handler).toContain('res.status(200)');
  });
});

describe('exportMocksAsExpressApp', () => {
  it('includes express boilerplate', () => {
    const mocks = mockRoutes(routes);
    const app = exportMocksAsExpressApp(mocks);
    expect(app).toContain("require('express')");
    expect(app).toContain('app.listen');
  });
  it('includes all route handlers', () => {
    const mocks = mockRoutes(routes);
    const app = exportMocksAsExpressApp(mocks);
    expect(app).toContain('/users');
  });
});
