import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { extractRoutesFromFile, extractRoutesFromDirectory, RouteEntry } from './routeExtractor';

describe('extractRoutesFromFile', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('extracts Express GET routes', () => {
    const filePath = path.join(tmpDir, 'app.ts');
    fs.writeFileSync(filePath, `app.get('/users', handler);\napp.post('/users', handler);`);
    const routes = extractRoutesFromFile(filePath);
    expect(routes).toHaveLength(2);
    expect(routes[0]).toMatchObject({ method: 'GET', path: '/users', line: 1 });
    expect(routes[1]).toMatchObject({ method: 'POST', path: '/users', line: 2 });
  });

  it('extracts Fastify routes', () => {
    const filePath = path.join(tmpDir, 'routes.ts');
    fs.writeFileSync(filePath, `fastify.get('/health', opts, handler);\nfastify.delete('/items/:id', handler);`);
    const routes = extractRoutesFromFile(filePath);
    expect(routes).toHaveLength(2);
    expect(routes[0]).toMatchObject({ method: 'GET', path: '/health' });
    expect(routes[1]).toMatchObject({ method: 'DELETE', path: '/items/:id' });
  });

  it('returns empty array for file with no routes', () => {
    const filePath = path.join(tmpDir, 'empty.ts');
    fs.writeFileSync(filePath, `const x = 1;\nconsole.log(x);`);
    const routes = extractRoutesFromFile(filePath);
    expect(routes).toHaveLength(0);
  });

  it('throws if file does not exist', () => {
    expect(() => extractRoutesFromFile('/nonexistent/file.ts')).toThrow('File not found');
  });

  it('includes file path in each route entry', () => {
    const filePath = path.join(tmpDir, 'routes.ts');
    fs.writeFileSync(filePath, `router.put('/items/:id', handler);`);
    const routes = extractRoutesFromFile(filePath);
    expect(routes[0].file).toBe(filePath);
  });
});

describe('extractRoutesFromDirectory', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-dir-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('recursively extracts routes from nested files', () => {
    const subDir = path.join(tmpDir, 'routes');
    fs.mkdirSync(subDir);
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), `app.get('/', handler);`);
    fs.writeFileSync(path.join(subDir, 'users.ts'), `router.get('/users', h);\nrouter.post('/users', h);`);
    const routes = extractRoutesFromDirectory(tmpDir);
    expect(routes.length).toBeGreaterThanOrEqual(3);
  });

  it('ignores non-ts/js files', () => {
    fs.writeFileSync(path.join(tmpDir, 'notes.md'), `app.get('/fake', h);`);
    const routes = extractRoutesFromDirectory(tmpDir);
    expect(routes).toHaveLength(0);
  });

  it('throws if directory does not exist', () => {
    expect(() => extractRoutesFromDirectory('/no/such/dir')).toThrow('Directory not found');
  });
});
