import { formatReport, ReportOptions } from './reportFormatter';
import { DiffResult } from '../diff/routeDiffer';

const emptyDiff: DiffResult = { added: [], removed: [], modified: [] };

const sampleDiff: DiffResult = {
  added: [{ method: 'POST', path: '/users', handler: 'createUser' }],
  removed: [{ method: 'DELETE', path: '/legacy', handler: 'legacyDelete' }],
  modified: [
    {
      before: { method: 'GET', path: '/items', handler: 'listItems' },
      after: { method: 'GET', path: '/items', handler: 'listItemsV2' },
    },
  ],
};

describe('formatReport', () => {
  describe('text format', () => {
    it('shows no changes message when diff is empty', () => {
      const result = formatReport(emptyDiff, { format: 'text' });
      expect(result).toContain('No route changes detected.');
    });

    it('includes title in output', () => {
      const result = formatReport(emptyDiff, { format: 'text', title: 'My Report' });
      expect(result).toContain('My Report');
    });

    it('includes summary line with counts', () => {
      const result = formatReport(sampleDiff, { format: 'text' });
      expect(result).toContain('+1 added');
      expect(result).toContain('-1 removed');
      expect(result).toContain('~1 modified');
    });

    it('uses default title when none provided', () => {
      const result = formatReport(emptyDiff, { format: 'text' });
      expect(result).toContain('Route Diff Report');
    });
  });

  describe('markdown format', () => {
    it('shows no changes blockquote when diff is empty', () => {
      const result = formatReport(emptyDiff, { format: 'markdown' });
      expect(result).toContain('> No route changes detected.');
    });

    it('renders added routes section', () => {
      const result = formatReport(sampleDiff, { format: 'markdown' });
      expect(result).toContain('### Added Routes');
      expect(result).toContain('`POST /users`');
    });

    it('renders removed routes section', () => {
      const result = formatReport(sampleDiff, { format: 'markdown' });
      expect(result).toContain('### Removed Routes');
      expect(result).toContain('`DELETE /legacy`');
    });

    it('renders summary line', () => {
      const result = formatReport(sampleDiff, { format: 'markdown' });
      expect(result).toContain('**Summary:**');
    });
  });

  describe('json format', () => {
    it('returns valid JSON', () => {
      const result = formatReport(sampleDiff, { format: 'json' });
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('includes summary counts in JSON output', () => {
      const result = formatReport(sampleDiff, { format: 'json' });
      const parsed = JSON.parse(result);
      expect(parsed.summary.added).toBe(1);
      expect(parsed.summary.removed).toBe(1);
      expect(parsed.summary.modified).toBe(1);
    });

    it('includes full diff in JSON output', () => {
      const result = formatReport(sampleDiff, { format: 'json' });
      const parsed = JSON.parse(result);
      expect(parsed.diff.added[0].path).toBe('/users');
    });

    it('includes custom title in JSON output', () => {
      const result = formatReport(sampleDiff, { format: 'json', title: 'Deployment Check' });
      const parsed = JSON.parse(result);
      expect(parsed.title).toBe('Deployment Check');
    });
  });
});
