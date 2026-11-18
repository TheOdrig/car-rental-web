import type { components } from './generated/openapi';

export type Schemas = components['schemas'];

export type WithRequired<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
