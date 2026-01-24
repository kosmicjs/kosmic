#!/usr/bin/env node --experimental-strip-types
/**
 * Sync script that deep merges package.base.json into each packages/* workspace
 * The base fields override package-specific fields for consistency
 */
import fs from 'node:fs';
import process from 'node:process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import type {PackageJson} from 'type-fest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Deep merge two objects, where source takes precedence over target
 */
function deepMerge(target: PackageJson, source: PackageJson): PackageJson {
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
      result[key] = deepMerge(
        targetValue as PackageJson,
        sourceValue as PackageJson,
      );
    } else {
      // Source overrides target
      result[key] = sourceValue ?? null;
    }
  }

  return result;
}

async function syncPackages() {
  const rootDir = path.resolve(__dirname, '..');
  const packagesDir = path.join(rootDir, 'packages');
  const basePackagePath = path.join(__dirname, 'package.json.base');

  // Read base package.json
  const basePackage = JSON.parse(
    fs.readFileSync(basePackagePath, 'utf8'),
  ) as PackageJson;

  console.log('📦 Syncing packages with package.json.base...\n');

  // Get all package directories
  const packageDirs = fs
    .readdirSync(packagesDir, {withFileTypes: true})
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const pkgName of packageDirs) {
    const pkgPath = path.join(packagesDir, pkgName, 'package.json');

    if (!fs.existsSync(pkgPath)) {
      console.log(`⚠️  Skipping ${pkgName}: no package.json found`);
      continue;
    }

    // Read current package.json
    const currentPackage = JSON.parse(
      fs.readFileSync(pkgPath, 'utf8'),
    ) as PackageJson;

    // Merge: package-specific fields first, then base overrides common fields
    const mergedPackage = deepMerge(currentPackage, basePackage);

    // Write back to file
    fs.writeFileSync(pkgPath, JSON.stringify(mergedPackage, null, 2) + '\n');

    console.log(`✅ Synced ${pkgName}`);
  }

  console.log('\n✨ All packages synced successfully!');
}

try {
  await syncPackages();
} catch (error: unknown) {
  console.error('❌ Error syncing packages:', error);
  process.exit(1);
}
