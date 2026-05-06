import { Route } from '../index';
import { MockConfig, MockRoute, mockRoutes, exportMocksAsExpressApp } from './routeMocker';
import { writeFileSync } from 'fs';

export { MockRoute, MockConfig } from './routeMocker';

export function generateMocks(routes: Route[], config?: MockConfig): MockRoute[] {
  return mockRoutes(routes, config);
}

export function printMockSummary(mocks: MockRoute[]): void {
  console.log(`\nGenerated ${mocks.length} mock route(s):`);
  for (const mock of mocks) {
    const bodyPreview = mock.responseBody === null
      ? 'null'
      : JSON.stringify(mock.responseBody).slice(0, 40);
    console.log(`  [${mock.method}] ${mock.path} → ${mock.statusCode} ${bodyPreview}`);
  }
}

export function saveMocksToFile(mocks: MockRoute[], outputPath: string): void {
  const content = outputPath.endsWith('.js')
    ? exportMocksAsExpressApp(mocks)
    : JSON.stringify(mocks, null, 2);
  writeFileSync(outputPath, content, 'utf-8');
  console.log(`Mock file written to ${outputPath}`);
}
