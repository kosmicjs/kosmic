import {mkdirSync, writeFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import type {Context} from 'koa';

// Mock Koa context helper
export function createMockContext(overrides?: Partial<Context>): Context {
  const baseCtx = {
    method: 'GET',
    originalUrl: '/',
    request: {},
    params: undefined,
    ...overrides,
  };
  return baseCtx as Context;
}

// Mock next function
export function createMockNext() {
  let called = false;
  const next = async () => {
    called = true;
  };

  next.wasCalled = () => called;
  return next;
}

// Helper to create temporary test routes
export function createTestRoute(
  dir: string,
  relativePath: string,
  content: string,
) {
  const fullPath = join(dir, relativePath);
  const dirPath = fullPath.slice(0, Math.max(0, fullPath.lastIndexOf('/')));
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, {recursive: true});
  }

  writeFileSync(fullPath, content);
}
