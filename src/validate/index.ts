import { validateRoutes } from './routeValidator';
import type { Route } from '../index';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a list of routes and returns a structured result.
 * Errors indicate invalid routes (bad method, bad path).
 * Warnings indicate potential issues (duplicates).
 */
export function validate(routes: Route[]): ValidationResult {
  return validateRoutes(routes);
}

/**
 * Prints a human-readable validation summary to the console.
 */
export function printValidationResult(result: ValidationResult): void {
  if (result.valid && result.warnings.length === 0) {
    console.log('✅ All routes are valid.');
    return;
  }

  if (result.errors.length > 0) {
    console.error(`❌ Validation failed with ${result.errors.length} error(s):`);
    result.errors.forEach((err) => console.error(`  - ${err}`));
  }

  if (result.warnings.length > 0) {
    console.warn(`⚠️  ${result.warnings.length} warning(s):`);
    result.warnings.forEach((warn) => console.warn(`  - ${warn}`));
  }
}

export { validateRoutes } from './routeValidator';
