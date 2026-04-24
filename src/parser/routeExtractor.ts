import * as fs from 'fs';
import * as path from 'path';

export interface RouteEntry {
  method: string;
  path: string;
  line?: number;
  file?: string;
}

const EXPRESS_ROUTE_PATTERN =
  /(?:app|router)\.(get|post|put|patch|delete|options|head|all)\s*\(\s*['"`]([^'"`]+)['"`]/gi;

const FASTIFY_ROUTE_PATTERN =
  /fastify\.(?:route\s*\(\s*\{[^}]*method:\s*['"`](\w+)['"`][^}]*url:\s*['"`]([^'"`]+)['"`]|(?:get|post|put|patch|delete|options|head)\s*\(\s*['"`]([^'"`]+)['"`])/gi;

export function extractRoutesFromFile(filePath: string): RouteEntry[] {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const lines = content.split('\n');
  const routes: RouteEntry[] = [];

  lines.forEach((line, index) => {
    let match: RegExpExecArray | null;
    const expressRegex =
      /(?:app|router)\.(get|post|put|patch|delete|options|head|all)\s*\(\s*['"`]([^'"`]+)['"`]/i;

    match = expressRegex.exec(line);
    if (match) {
      routes.push({
        method: match[1].toUpperCase(),
        path: match[2],
        line: index + 1,
        file: filePath,
      });
      return;
    }

    const fastifySimple =
      /fastify\.(get|post|put|patch|delete|options|head)\s*\(\s*['"`]([^'"`]+)['"`]/i;
    match = fastifySimple.exec(line);
    if (match) {
      routes.push({
        method: match[1].toUpperCase(),
        path: match[2],
        line: index + 1,
        file: filePath,
      });
    }
  });

  return routes;
}

export function extractRoutesFromDirectory(dirPath: string): RouteEntry[] {
  const absoluteDir = path.resolve(dirPath);
  if (!fs.existsSync(absoluteDir)) {
    throw new Error(`Directory not found: ${absoluteDir}`);
  }

  const allRoutes: RouteEntry[] = [];
  const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(absoluteDir, entry.name);
    if (entry.isDirectory()) {
      allRoutes.push(...extractRoutesFromDirectory(fullPath));
    } else if (entry.isFile() && /\.(ts|js)$/.test(entry.name)) {
      allRoutes.push(...extractRoutesFromFile(fullPath));
    }
  }

  return allRoutes;
}
