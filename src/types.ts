export type KeyType = string | number | symbol;

/**
 * Create<T, K>
 * - By default the primary key K is optional on create (so datastore can auto-generate string ids).
 */
type DefaultKey<T> = 'id' extends keyof T ? 'id' : keyof T;

export type Create<T, K extends keyof T = DefaultKey<T>> = Omit<T, K> & Partial<Pick<T, K>>;
/**
 * Update<T, K>
 * - Update should never include the primary key (key is provided separately).
 */
export type Update<T, K extends keyof T = DefaultKey<T>> = Partial<Omit<T, K>>;
/**
 * Pagination and sorting options
 */
export type SortDirection = 'asc' | 'desc';
export type QueryOptions<T = any> = {
  limit?: number;
  offset?: number;
  sortBy?: keyof T;
  sortDir?: SortDirection;
};

/**
 * FieldFilter: conditional mapped type that exposes
 * different operators depending on field type
 */
export type Primitive = string | number | boolean | Date;

export type FieldFilter<V> =
  V extends string ? {
    eq?: V;
    contains?: string;
    startsWith?: string;
    endsWith?: string;
  } : V extends number ? {
    eq?: V;
    lt?: V;
    lte?: V;
    gt?: V;
    gte?: V;
    between?: [V, V];
  } : V extends Date ? {
    eq?: V;
    before?: V;
    after?: V;
    between?: [V, V];
  } : {
    eq?: V;
  };

/**
 * Filter<T>: for each field of T option to supply FieldFilter
 * also allow compositional operators $and/$or
 */
export type Filter<T> = {
  [P in keyof T]?: FieldFilter<T[P]>;
} & {
  $and?: Filter<T>[];
  $or?: Filter<T>[];
};
