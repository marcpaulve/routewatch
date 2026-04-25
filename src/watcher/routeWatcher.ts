import * as chokidar from 'chokidar';
import * as path from 'path';
import { EventEmitter } from 'events';
import { extractRoutesFromDirectory } from '../parser/routeExtractor';
import { Route } from '../parser';

export interface WatcherOptions {
  directory: string;
  debounceMs?: number;
  extensions?: string[];
}

export interface RouteChangeEvent {
  timestamp: Date;
  changedFile: string;
  routes: Route[];
}

export class RouteWatcher extends EventEmitter {
  private watcher: chokidar.FSWatcher | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private options: Required<WatcherOptions>;

  constructor(options: WatcherOptions) {
    super();
    this.options = {
      debounceMs: 300,
      extensions: ['.ts', '.js'],
      ...options,
    };
  }

  start(): void {
    const { directory, extensions, debounceMs } = this.options;
    const globs = extensions.map((ext) => path.join(directory, `**/*${ext}`));

    this.watcher = chokidar.watch(globs, {
      ignoreInitial: false,
      persistent: true,
    });

    const handleChange = (filePath: string) => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(async () => {
        try {
          const routes = await extractRoutesFromDirectory(directory);
          const event: RouteChangeEvent = {
            timestamp: new Date(),
            changedFile: filePath,
            routes,
          };
          this.emit('change', event);
        } catch (err) {
          this.emit('error', err);
        }
      }, debounceMs);
    };

    this.watcher.on('add', handleChange);
    this.watcher.on('change', handleChange);
    this.watcher.on('unlink', handleChange);
    this.watcher.on('error', (err) => this.emit('error', err));

    this.emit('ready', { directory });
  }

  stop(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.watcher) {
      return this.watcher.close().then(() => {
        this.watcher = null;
        this.emit('stopped');
      });
    }
    return Promise.resolve();
  }

  isWatching(): boolean {
    return this.watcher !== null;
  }
}

export function createRouteWatcher(options: WatcherOptions): RouteWatcher {
  return new RouteWatcher(options);
}
