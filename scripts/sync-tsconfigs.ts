#!/usr/bin/env node --experimental-strip-types
/**
 * Sync script that deep merges tsconfig.json.base into each packages/* workspace
 * The base fields override package-specific fields for consistency
 */
import fs from 'node:fs';
import process from 'node:process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type TsConfig = {
  [key: string]: unknown;
  extends?: string;
  compilerOptions?: Record<string, unknown>;
  include?: string[];
  exclude?: string[];
  references?: Array<{path: string}>;
};

/**
 * Deep merge two objects, where source takes precedence over target
 */
function deepMerge(target: TsConfig, source: TsConfig): TsConfig {
  const result = {...target};

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      // Deep merge objects
      result[key] = deepMerge(targetValue as TsConfig, sourceValue as TsConfig);
    } else {
      // Source overrides target
      result[key] = sourceValue ?? null;
    }
  }

  return result;
}

async function syncTsConfigs() {
  const rootDir = path.resolve(__dirname, '..');
  const packagesDir = path.join(rootDir, 'packages');
  const baseTsConfigPath = path.join(__dirname, 'tsconfig.json.base');

  // Read base tsconfig.json
  const baseTsConfig = JSON.parse(
    fs.readFileSync(baseTsConfigPath, 'utf8'),
  ) as TsConfig;

  console.log('⚙️  Syncing tsconfigs with tsconfig.json.base...\n');

  // Get all package directories
  const packageDirs = fs
    .readdirSync(packagesDir, {withFileTypes: true})
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const pkgName of packageDirs) {
    const tsConfigPath = path.join(packagesDir, pkgName, 'tsconfig.json');

    if (!fs.existsSync(tsConfigPath)) {
      console.log(`⚠️  Skipping ${pkgName}: no tsconfig.json found`);
      continue;
    }

    // Read current tsconfig.json
    const currentTsConfig = JSON.parse(
      fs.readFileSync(tsConfigPath, 'utf8'),
    ) as TsConfig;

    // Merge: package-specific fields first, then base overrides common fields
    const mergedTsConfig = deepMerge(currentTsConfig, baseTsConfig);

    // Write back to file
    fs.writeFileSync(
      tsConfigPath,
      JSON.stringify(mergedTsConfig, null, 2) + '\n',
    );

    console.log(`✅ Synced ${pkgName}`);
  }

  console.log('\n✨ All tsconfigs synced successfully!');
}

try {
  await syncTsConfigs();
} catch (error: unknown) {
  console.error('❌ Error syncing tsconfigs:', error);
  process.exit(1);
}
