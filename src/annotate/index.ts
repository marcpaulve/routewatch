import { Route } from '../index';
import {
  AnnotatedRoute,
  AnnotationRule,
  annotateRoutes,
  getAnnotationSummary,
} from './routeAnnotator';

export { AnnotatedRoute, AnnotationRule, Annotation } from './routeAnnotator';

export function applyAnnotations(
  routes: Route[],
  rules: AnnotationRule[]
): AnnotatedRoute[] {
  return annotateRoutes(routes, rules);
}

export function printAnnotationSummary(annotated: AnnotatedRoute[]): void {
  const summary = getAnnotationSummary(annotated);
  const keys = Object.keys(summary);

  if (keys.length === 0) {
    console.log('No annotations applied.');
    return;
  }

  console.log('Annotation Summary:');
  for (const key of keys) {
    console.log(`  [${key}] (${summary[key].length} route(s))`);
    for (const route of summary[key]) {
      console.log(`    - ${route}`);
    }
  }
}

export function printAnnotatedRoutes(annotated: AnnotatedRoute[]): void {
  for (const route of annotated) {
    const annStr =
      route.annotations.length > 0
        ? route.annotations.map((a) => `${a.key}=${a.value}`).join(', ')
        : '(none)';
    console.log(`${route.method.toUpperCase()} ${route.path}  [${annStr}]`);
  }
}
