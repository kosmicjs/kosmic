/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import {type Middleware} from 'koa';
import {type MatchFunction} from 'path-to-regexp';
import type {Simplify} from 'type-fest';

export type HttpVerb = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type HttpVerbsAll = Simplify<HttpVerb | 'all'>;

export type UseObject = {
  [key in HttpVerbsAll]?: Middleware | Middleware[];
};

export type Use = Middleware | Middleware[] | UseObject | UseObject[];

/**
 * The zod validated typescript type of the module exported from a route file
 */
export type RouteModule = {
  [key in HttpVerb | 'del']?: Middleware;
} & {
  use?: Use;
};

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class RouteClass implements RouteModule {}

export type RouteDefinition = {
  /**
   * The path of the route expressed as a path-to-regexp string
   */
  uriPath: string;
  /**
   * The path to the file on disk
   */
  filePath: string;
  /**
   * The path-to-regexp match function which can be used to extract params from a url
   *
   * @example
   * ```ts
   * const isMatch = route.match('/users/:id');
   * ```
   */
  match: MatchFunction<Record<string, string | undefined>>;
  /**
   * The raw module exported from the file
   * (schema validated by zod)
   */
  module: RouteModule;
  /**
   * The params extracted from the url to be passed into the route handler
   */
  params?: Record<string, string | undefined>;

  /**
   * The middleware to be executed before the route handler, already bundled into composed handlers, but exposed on the route definition for debugging purposes
   */

  collectedMiddleware?: Record<HttpVerbsAll, Middleware[]>;
} & {
  [key in HttpVerb]?: Middleware;
};
