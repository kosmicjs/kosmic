/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import ts from 'typescript';

const noop = async () => undefined;

export function tsWatch(callback?: () => Promise<void>) {
  const configPath = ts.findConfigFile(
    './',
    ts.sys.fileExists,
    'tsconfig.json',
  );
  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }

  const origWatchStatusReporter: ts.WatchStatusReporter =
    // @ts-expect-error private API for no reason
    ts.createWatchStatusReporter(ts.sys, true) as ts.WatchStatusReporter;

  const origWatchDiagnosticReporter: ts.DiagnosticReporter =
    // @ts-expect-error private API for no reason
    ts.createDiagnosticReporter(ts.sys, true) as ts.DiagnosticReporter;

  // Note that there is another overload for `createWatchCompilerHost` that takes a set of root files.
  const host = ts.createWatchCompilerHost(
    configPath,
    {preserveWatchOutput: true, noEmitOnError: true},
    ts.sys,
    ts.createEmitAndSemanticDiagnosticsBuilderProgram,
    origWatchDiagnosticReporter,
    createWatchStatusChanged(origWatchStatusReporter, callback ?? noop),
  );

  return ts.createWatchProgram(host);
}

function createWatchStatusChanged(
  watchStatusReporter: (diagnostic: ts.Diagnostic, ...args: any[]) => any,
  onSuccess: () => Promise<void>,
) {
  return async function (this: any, diagnostic: ts.Diagnostic, ...args: any[]) {
    // eslint-disable-next-line promise/prefer-await-to-then
    return onSuccess().then(() =>
      watchStatusReporter.call(this, diagnostic, ...args),
    );
  };
}
