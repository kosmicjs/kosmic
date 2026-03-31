import fs from 'node:fs/promises';
import path from 'node:path';
import {authTemplateFiles} from './templates/auth.ts';
import {baseTemplateFiles} from './templates/base.ts';

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
 * Replace known placeholders in template file content.
 */
function renderTemplate(
  fileContents: string,
  context: {projectName: string},
): string {
  return fileContents.replaceAll('{{projectName}}', context.projectName);
}

/**
 * Write all template files to the target directory.
 */
async function writeTemplates(
  targetDirectory: string,
  templateFiles: Record<string, string>,
  context: {projectName: string},
): Promise<void> {
  const writes = Object.entries(templateFiles).map(
    async ([relativePath, templateValue]) => {
      const outputPath = path.join(targetDirectory, relativePath);
      await fs.mkdir(path.dirname(outputPath), {recursive: true});
      await fs.writeFile(
        outputPath,
        renderTemplate(templateValue, context),
        'utf8',
      );
    },
  );

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

  await writeTemplates(targetDirectory, baseTemplateFiles, context);

  if (withAuth) {
    await writeTemplates(targetDirectory, authTemplateFiles, context);
  }
}
