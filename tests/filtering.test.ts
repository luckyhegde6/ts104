import { DataStore } from '../src/datastore';

interface Person {
  id: string;
  name: string;
  age: number;
  city: string;
  createdAt: Date;
}

describe('Filtering and sorting', () => {
  const ds = new DataStore<Person, 'id'>('id');
  const now = new Date();

  beforeAll(() => {
    ds.create({ name: 'Alice', age: 25, city: 'Paris', createdAt: now });
    ds.create({ name: 'Bob', age: 35, city: 'London', createdAt: now });
    ds.create({ name: 'Charlie', age: 45, city: 'Paris', createdAt: now });
  });

  test('filter by string contains', () => {
    const result = ds.query({ name: { contains: 'li' } });
    expect(result.map(r => r.name)).toContain('Alice');
    expect(result.map(r => r.name)).toContain('Charlie');
  });

  test('filter by numeric range', () => {
    const result = ds.query({ age: { between: [30, 40] } });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob');
  });

  test('filter by AND/OR composition', () => {
    const result = ds.query({
      $or: [{ city: { eq: 'London' } }, { age: { gt: 40 } }]
    });
    expect(result.map(r => r.name)).toEqual(expect.arrayContaining(['Bob', 'Charlie']));
  });

  test('pagination + sorting', () => {
    const result = ds.list({ sortBy: 'age', sortDir: 'asc', limit: 2 });
    expect(result[0].age).toBeLessThan(result[1].age);
  });
});
