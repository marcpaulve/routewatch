import { Route } from '../index';
import { lintRoutes, defaultRules, LintRule, LintResult, LintViolation } from './routeLinter';

export { LintRule, LintResult, LintViolation, defaultRules };

export function runLint(routes: Route[], rules?: LintRule[]): LintResult {
  return lintRoutes(routes, rules);
}

const SEVERITY_PREFIX: Record<string, string> = {
  error: '✖ error',
  warn:  '⚠ warn ',
  info:  'ℹ info ',
};

export function formatLintResult(result: LintResult): string {
  if (result.violations.length === 0) {
    return '✔ No lint violations found.';
  }

  const lines: string[] = [];

  for (const v of result.violations) {
    const prefix = SEVERITY_PREFIX[v.severity] ?? v.severity;
    lines.push(`  [${prefix}] (${v.ruleId}) ${v.message}`);
  }

  lines.push('');
  lines.push(
    `${result.errorCount} error(s), ${result.warnCount} warning(s), ${result.infoCount} info(s) — ${result.violations.length} total violation(s)`,
  );

  return lines.join('\n');
}

export function printLintResult(result: LintResult): void {
  console.log(formatLintResult(result));
}
