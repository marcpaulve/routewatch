import { formatStatsText, formatStatsJson, formatStatsMarkdown } from './statsFormatter';
import { RouteStats } from './routeStats';

const sampleStats: RouteStats = {
  total: 6,
  byMethod: { GET: 4, POST: 1, DELETE: 1 },
  byPrefix: { '/users': 4, '/products': 2 },
  uniquePaths: 4,
  duplicatePaths: ['/users', '/users/:id'],
  averagePathDepth: 1.67,
  deepestPath: '/products/:id/reviews',
  mostCommonMethod: 'GET',
};

describe('formatStatsText', () => {
  it('includes total route count', () => {
    const output = formatStatsText(sampleStats);
    expect(output).toContain('Total routes');
    expect(output).toContain('6');
  });

  it('includes method breakdown', () => {
    const output = formatStatsText(sampleStats);
    expect(output).toContain('GET');
    expect(output).toContain('POST');
  });

  it('includes duplicate paths section when duplicates exist', () => {
    const output = formatStatsText(sampleStats);
    expect(output).toContain('Duplicate Paths');
    expect(output).toContain('/users');
  });

  it('omits duplicate section when no duplicates', () => {
    const noDups = { ...sampleStats, duplicatePaths: [] };
    const output = formatStatsText(noDups);
    expect(output).not.toContain('Duplicate Paths');
  });
});

describe('formatStatsJson', () => {
  it('returns valid JSON', () => {
    const output = formatStatsJson(sampleStats);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('includes all stat fields', () => {
    const parsed = JSON.parse(formatStatsJson(sampleStats));
    expect(parsed.total).toBe(6);
    expect(parsed.mostCommonMethod).toBe('GET');
    expect(parsed.deepestPath).toBe('/products/:id/reviews');
  });
});

describe('formatStatsMarkdown', () => {
  it('includes markdown heading', () => {
    const output = formatStatsMarkdown(sampleStats);
    expect(output).toContain('## Route Statistics');
  });

  it('includes table rows for methods', () => {
    const output = formatStatsMarkdown(sampleStats);
    expect(output).toContain('| GET |');
    expect(output).toContain('| DELETE |');
  });

  it('includes total and unique path counts', () => {
    const output = formatStatsMarkdown(sampleStats);
    expect(output).toContain('6');
    expect(output).toContain('4');
  });
});
