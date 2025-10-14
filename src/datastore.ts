import { Create, Update, Filter, QueryOptions } from './types';
import { Logger, ConsoleLogger } from './logger';
type DefaultKey<T> = 'id' extends keyof T ? 'id' : keyof T;
/**
 * Generic DataStore
 * - T: entity shape
 * - K: primary key name (must be keyof T)
 * - V = T[K] must be acceptable key (string|number|symbol)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class DataStore<T extends Record<string, any>, K extends keyof T = DefaultKey<T>> {
  private map = new Map<T[K], T>();
  private logger: Logger;
  private autoIdSeed = 1;

  constructor(
    private keyName: K,
    logger?: Logger
  ) {
    this.logger = logger ?? ConsoleLogger;
  }

  private generateId(): string {
    return `id_${Date.now().toString(36)}_${this.autoIdSeed++}`;
  }

  create(item: Create<T, K>): T {
    const key = item[this.keyName as keyof Create<T, K>] as T[K] | undefined;

    let finalKey: T[K];
    if (key === undefined || key === null) {
      const generated = this.generateId();
      finalKey = generated as unknown as T[K];
    } else {
      finalKey = key;
    }

    const record: T = { ...(item as unknown as T), [this.keyName]: finalKey } as T;
    if (this.map.has(finalKey)) {
      throw new Error(`Duplicate key: ${String(finalKey)}`);
    }
    this.map.set(finalKey, record);
    this.logger.info('create', { key: finalKey, record });
    return record;
  }

  get(key: T[K]): T | undefined {
    this.logger.debug('get', key);
    return this.map.get(key);
  }

  update(key: T[K], patch: Update<T, K>): T {
    const existing = this.map.get(key);
    if (!existing) throw new Error('NotFound');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = { ...existing, ...(patch as any) } as T;
    this.map.set(key, updated);
    this.logger.info('update', { key, patch });
    return updated;
  }

  delete(key: T[K]): boolean {
    const existed = this.map.delete(key);
    this.logger.info('delete', { key, existed });
    return existed;
  }

  list(options?: QueryOptions<T>): T[] {
    let arr = Array.from(this.map.values());
    if (options?.sortBy) {
      const dir = options.sortDir === 'desc' ? -1 : 1;
      arr = arr.sort((a, b) => {
        const va = a[options.sortBy!];
        const vb = b[options.sortBy!];
        if (va === vb) return 0;
        return (va > vb ? 1 : -1) * dir;
      });
    }
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? arr.length;
    return arr.slice(offset, offset + limit);
  }

  query(filter: Filter<T>, options?: QueryOptions<T>): T[] {
    const matches = Array.from(this.map.values()).filter((item) =>
      this.matchesFilter(item, filter)
    );
    let result = matches;
    if (options?.sortBy) {
      const dir = options.sortDir === 'desc' ? -1 : 1;
      result = result.sort((a, b) => {
        const va = a[options.sortBy!];
        const vb = b[options.sortBy!];
        if (va === vb) return 0;
        return (va > vb ? 1 : -1) * dir;
      });
    }
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? result.length;
    return result.slice(offset, offset + limit);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private matchesFilter(item: T, filter?: any): boolean {
    if (!filter || Object.keys(filter).length === 0) return true;

    // Compositional operators first
    if (filter.$and) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!filter.$and.every((f: any) => this.matchesFilter(item, f))) return false;
    }
    if (filter.$or) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!filter.$or.some((f: any) => this.matchesFilter(item, f))) return false;
    }

    for (const k of Object.keys(filter)) {
      if (k === '$and' || k === '$or') continue;
      const ff = filter[k];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const val = (item as any)[k];

      if (ff == null) continue;

      // String ops
      if (typeof val === 'string') {
        if (ff.eq !== undefined && val !== ff.eq) return false;
        if (ff.contains !== undefined && !val.includes(ff.contains)) return false;
        if (ff.startsWith !== undefined && !val.startsWith(ff.startsWith)) return false;
        if (ff.endsWith !== undefined && !val.endsWith(ff.endsWith)) return false;
      } else if (typeof val === 'number') {
        if (ff.eq !== undefined && val !== ff.eq) return false;
        if (ff.lt !== undefined && !(val < ff.lt)) return false;
        if (ff.lte !== undefined && !(val <= ff.lte)) return false;
        if (ff.gt !== undefined && !(val > ff.gt)) return false;
        if (ff.gte !== undefined && !(val >= ff.gte)) return false;
        if (ff.between !== undefined) {
          const [a, b] = ff.between;
          if (!(val >= a && val <= b)) return false;
        }
      } else if (val instanceof Date) {
        const vtime = val.getTime();
        if (ff.eq !== undefined && vtime !== ff.eq.getTime()) return false;
        if (ff.before !== undefined && !(vtime < ff.before.getTime())) return false;
        if (ff.after !== undefined && !(vtime > ff.after.getTime())) return false;
        if (ff.between !== undefined) {
          const [a, b] = ff.between;
          if (!(vtime >= a.getTime() && vtime <= b.getTime())) return false;
        }
      } else {
        // fallback eq
        if (ff.eq !== undefined && val !== ff.eq) return false;
      }
    }
    return true;
  }

  // Simple transaction support: create snapshot; commit/rollback
  transaction<R>(fn: (ds: TransactionalProxy<T, K>) => R): R {
    const snapshot = new Map(this.map);
    const proxy = new TransactionalProxy(this);
    try {
      const res = fn(proxy);
      // commit already applied to underlying map
      this.logger.info('transaction.commit');
      return res;
    } catch (err) {
      // rollback
      this.map = snapshot;
      this.logger.warn('transaction.rollback', err);
      throw err;
    }
  }

  // internal use for TransactionalProxy
  _getInternalMap() {
    return this.map;
  }

  // for tests / debug
  clear() {
    this.map.clear();
    this.logger.info('clear');
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TransactionalProxy<T extends Record<string, any>, K extends keyof T = DefaultKey<T>> {
  constructor(private ds: DataStore<T, K>) {}
  create(item: Create<T, K>) {
    return this.ds.create(item);
  }
  get(key: T[K]) {
    return this.ds.get(key);
  }
  update(key: T[K], patch: Update<T, K>) {
    return this.ds.update(key, patch);
  }
  delete(key: T[K]) {
    return this.ds.delete(key);
  }
  list(options?: QueryOptions<T>) {
    return this.ds.list(options);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query(filter: any, options?: QueryOptions<T>) {
    return this.ds.query(filter, options);
  }
}
