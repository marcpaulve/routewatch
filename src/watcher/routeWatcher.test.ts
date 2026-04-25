import { RouteWatcher, createRouteWatcher, RouteChangeEvent } from './routeWatcher';
import * as routeExtractor from '../parser/routeExtractor';

jest.mock('../parser/routeExtractor');
jest.mock('chokidar', () => ({
  watch: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    close: jest.fn().mockResolvedValue(undefined),
  })),
}));

const mockExtractRoutesFromDirectory =
  routeExtractor.extractRoutesFromDirectory as jest.MockedFunction<
    typeof routeExtractor.extractRoutesFromDirectory
  >;

describe('RouteWatcher', () => {
  const defaultOptions = { directory: '/fake/src', debounceMs: 0 };

  beforeEach(() => {
    jest.clearAllMocks();
    mockExtractRoutesFromDirectory.mockResolvedValue([
      { method: 'GET', path: '/health' },
    ]);
  });

  it('should create a RouteWatcher instance via factory', () => {
    const watcher = createRouteWatcher(defaultOptions);
    expect(watcher).toBeInstanceOf(RouteWatcher);
  });

  it('should not be watching before start is called', () => {
    const watcher = new RouteWatcher(defaultOptions);
    expect(watcher.isWatching()).toBe(false);
  });

  it('should be watching after start is called', () => {
    const watcher = new RouteWatcher(defaultOptions);
    watcher.start();
    expect(watcher.isWatching()).toBe(true);
  });

  it('should emit ready event on start', () => {
    const watcher = new RouteWatcher(defaultOptions);
    const readyHandler = jest.fn();
    watcher.on('ready', readyHandler);
    watcher.start();
    expect(readyHandler).toHaveBeenCalledWith({ directory: '/fake/src' });
  });

  it('should not be watching after stop is called', async () => {
    const watcher = new RouteWatcher(defaultOptions);
    watcher.start();
    await watcher.stop();
    expect(watcher.isWatching()).toBe(false);
  });

  it('should emit stopped event after stop', async () => {
    const watcher = new RouteWatcher(defaultOptions);
    const stoppedHandler = jest.fn();
    watcher.on('stopped', stoppedHandler);
    watcher.start();
    await watcher.stop();
    expect(stoppedHandler).toHaveBeenCalled();
  });

  it('should resolve immediately if stop called without start', async () => {
    const watcher = new RouteWatcher(defaultOptions);
    await expect(watcher.stop()).resolves.toBeUndefined();
  });

  it('should use default debounceMs and extensions if not provided', () => {
    const watcher = new RouteWatcher({ directory: '/src' });
    expect(watcher).toBeDefined();
  });
});
