import { Route } from '../parser';
import {
  auditRoutes,
  AuditResult,
  AuditRule,
  AuditViolation,
  AuditSeverity,
  DEFAULT_RULES,
} from './routeAuditor';

export type { AuditResult, AuditRule, AuditViolation, AuditSeverity };
export { DEFAULT_RULES };

export function runAudit(
  routes: Route[],
  customRules?: AuditRule[]
): AuditResult {
  const rules = customRules ?? DEFAULT_RULES;
  return auditRoutes(routes, rules);
}

export function formatAuditResult(result: AuditResult): string {
  const lines: string[] = [];
  lines.push(`Audit complete: ${result.passed} passed, ${result.failed} failed.`);

  if (result.violations.length === 0) {
    lines.push('No violations found.');
    return lines.join('\n');
  }

  const bySeverity: Record<AuditSeverity, AuditViolation[]> = {
    error: [],
    warn: [],
    info: [],
  };

  for (const v of result.violations) {
    bySeverity[v.severity].push(v);
  }

  for (const severity of ['error', 'warn', 'info'] as AuditSeverity[]) {
    const group = bySeverity[severity];
    if (group.length === 0) continue;
    lines.push(`\n[${severity.toUpperCase()}]`);
    for (const v of group) {
      lines.push(
        `  ${v.route.method} ${v.route.path} — ${v.description} (${v.ruleId})`
      );
    }
  }

  return lines.join('\n');
}
