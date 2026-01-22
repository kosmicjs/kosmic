/**
 * Capitalizes the first letter of a string
 */
export function capitalize(string: string): string {
  if (string.length === 0) {
    return string;
  }

  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Clamps a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Creates a slug from a string (lowercase, hyphenated)
 */
export function slugify(string: string): string {
  return string
    .toLowerCase()
    .trim()
    .replaceAll(/[\W_]+/g, '-')
    .replaceAll(/^-+|-+$/g, '');
}
