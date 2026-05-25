import fs from 'node:fs/promises';
import path from 'node:path';
import {authTemplateDirectory} from './templates/auth.ts';
import {baseTemplateDirectory} from './templates/base.ts';

export type ScaffoldOptions = {
  readonly projectName: string;
  readonly targetDirectory: string;
  readonly withAuth: boolean;
  readonly force: boolean;
};

/**
 * Check whether a directory exists and contains at least one entry.
 */
export async function directoryHasFiles(
  targetDirectory: string,
): Promise<boolean> {
  try {
    const entries = await fs.readdir(targetDirectory);
    return entries.length > 0;
  } catch {
    return false;
  }
}

/**
 * Render placeholders in template content using the provided context.
 */
function renderTemplate(
  fileContents: string,
  context: Record<string, string>,
): string {
  return fileContents.replaceAll(
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/gv,
    (match: string, key: string): string => context[key] ?? match,
  );
}

/**
 * Recursively list all files in a template directory.
 */
async function getTemplateFiles(templateDirectory: string): Promise<string[]> {
  const entries = await fs.readdir(templateDirectory, {withFileTypes: true});
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(templateDirectory, entry.name);

      if (entry.isDirectory()) {
        return getTemplateFiles(entryPath);
      }

      return [entryPath];
    }),
  );

  return files.flat();
}

/**
 * Write template files from a source directory to the target directory.
 */
async function writeTemplates(
  targetDirectory: string,
  templateDirectory: string,
  context: Record<string, string>,
): Promise<void> {
  const templateFiles = await getTemplateFiles(templateDirectory);
  const writes = templateFiles.map(async (templatePath) => {
    const relativePath = path
      .relative(templateDirectory, templatePath)
      .replace(/\.tmpl$/v, '');
    const outputPath = path.join(targetDirectory, relativePath);
    const templateValue = await fs.readFile(templatePath, 'utf8');

    await fs.mkdir(path.dirname(outputPath), {recursive: true});
    await fs.writeFile(
      outputPath,
      renderTemplate(templateValue, context),
      'utf8',
    );
  });

  await Promise.all(writes);
}

/**
 * Create project files from the base template and optional auth overlay.
 */
export async function scaffoldKosmicProject(
  options: ScaffoldOptions,
): Promise<void> {
  const {targetDirectory, force, projectName, withAuth} = options;

  if (force) {
    await fs.rm(targetDirectory, {recursive: true, force: true});
  }

  await fs.mkdir(targetDirectory, {recursive: true});

  const context = {projectName};

  await writeTemplates(targetDirectory, baseTemplateDirectory, context);

  if (withAuth) {
    await writeTemplates(targetDirectory, authTemplateDirectory, context);
  }
}
