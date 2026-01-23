import type {Generated} from 'kysely';
import type {Simplify} from 'type-fest';

export type GeneratedId<T> = Simplify<Omit<T, 'id'> & {id: Generated<number>}>;
