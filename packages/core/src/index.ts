import {capitalize, slugify} from '@spence-s/utils';

export type Config = {
  name: string;
  slug: string;
  description: string;
};

/**
 * Creates a formatted title from a string
 */
export function createTitle(input: string): string {
  return input
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Creates a config object with formatted values
 */
export function createConfig(name: string, description: string): Config {
  return {
    name: createTitle(name),
    slug: slugify(name),
    description,
  };
}
