/**
 * Public API for route classification module.
 * Provides utilities to classify routes by type (CRUD, auth, static, etc.)
 * and group/summarize them accordingly.
 */

import {
  classifyRoute,
  classifyRoutes,
  groupByClassification,
  formatClassificationSummary,
  type ClassifiedRoute,
  type ClassificationGroup,
} from './routeClassifier';
import type { Route } from '../parser';

export type { ClassifiedRoute, ClassificationGroup };

/**
 * Classify a list of routes and return enriched route objects.
 */
export function applyClassifications(routes: Route[]): ClassifiedRoute[] {
  return classifyRoutes(routes);
}

/**
 * Group classified routes by their classification label.
 */
export function getClassificationGroups(
  routes: Route[]
): Record<string, ClassificationGroup> {
  const classified = classifyRoutes(routes);
  return groupByClassification(classified);
}

/**
 * Print a human-readable classification summary to stdout.
 */
export function printClassificationSummary(routes: Route[]): void {
  const classified = classifyRoutes(routes);
  const groups = groupByClassification(classified);
  const summary = formatClassificationSummary(groups);
  console.log(summary);
}

export { classifyRoute, classifyRoutes, groupByClassification, formatClassificationSummary };
