import ts from 'typescript';

const noop = async () => undefined;

export function tsWatch(callback) {
  const configPath = ts.findConfigFile(
    './',
    ts.sys.fileExists,
    'tsconfig.json',
  );
  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }

  const origWatchStatusReporter = ts.createWatchStatusReporter(ts.sys, true);

  const origWatchDiagnosticReporter = ts.createDiagnosticReporter(ts.sys, true);

  // Note that there is another overload for `createWatchCompilerHost` that takes a set of root files.
  const host = ts.createWatchCompilerHost(
    configPath,
    {preserveWatchOutput: true, noEmitOnError: true},
    ts.sys,
    ts.createEmitAndSemanticDiagnosticsBuilderProgram,
    origWatchDiagnosticReporter,
    createWatchStatusChanged(origWatchStatusReporter, callback ?? noop),
  );

  // `createWatchProgram` creates an initial program, watches files, and updates the program over time.
  return ts.createWatchProgram(host);
}

function createWatchStatusChanged(watchStatusReporter, callback) {
  return async function (diagnostic, ...args) {
    // eslint-disable-next-line promise/prefer-await-to-then
    return callback().then(() =>
      watchStatusReporter.call(this, diagnostic, ...args),
    );
  };
}

// function createDiagnosticReporter(
//   diagnosticReporter: (diagnostic: ts.Diagnostic, ...args: any[]) => any,
// ) {
//   return function (this: any, diagnostic: ts.Diagnostic, ...args: any[]) {
//     return diagnosticReporter.call(this, diagnostic, ...args);
//   };
// }
