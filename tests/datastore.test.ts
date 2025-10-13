import { DataStore } from '../src/datastore';

interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
}

describe('DataStore<Product>', () => {
  let ds: DataStore<Product, 'id'>;

  beforeEach(() => {
    ds = new DataStore<Product, 'id'>('id');
  });

  test('create/get/delete lifecycle', () => {
    const p = ds.create({ name: 'book', price: 20, createdAt: new Date() });
    expect(p.id).toBeDefined();
    const fetched = ds.get(p.id);
    expect(fetched?.name).toBe('book');

    const updated = ds.update(p.id, { price: 25 });
    expect(updated.price).toBe(25);

    expect(ds.delete(p.id)).toBe(true);
    expect(ds.get(p.id)).toBeUndefined();
  });

  test('query with number range', () => {
    ds.create({ name: 'cheap', price: 5, createdAt: new Date() });
    ds.create({ name: 'mid', price: 50, createdAt: new Date() });
    ds.create({ name: 'exp', price: 999, createdAt: new Date() });

    const results = ds.query({ price: { between: [10, 100] } });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('mid');
  });

  test('transaction commits and rollbacks', () => {
    const p1 = ds.create({ name: 't1', price: 10, createdAt: new Date() });

    try {
      ds.transaction(() => {
        ds.create({ name: 't2', price: 20, createdAt: new Date(), id: 't2' });
        throw new Error('boom');
      });
    } catch {}

    // t2 should not exist, because transaction rolled back
    expect(ds.get('t2')).toBeUndefined();
  });
});
