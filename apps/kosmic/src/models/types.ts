import type {Generated} from '@kosmic/db';
import type {Simplify} from 'type-fest';

export type GeneratedId<T> = Simplify<Omit<T, 'id'> & {id: Generated<number>}>;
