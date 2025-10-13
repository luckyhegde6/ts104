import { DataStore } from '../src/datastore';

interface User {
  id: string; // primary key
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
}

const users = new DataStore<User, 'id'>('id');

const alice = users.create({ name: 'Alice', email: 'a@x.com', createdAt: new Date() });
const bob = users.create({ name: 'Bob', email: 'b@x.com', createdAt: new Date(), id: 'bob-id' });

console.log('All users', users.list());
console.log('Find bob by id', users.get('bob-id'));

const adults = users.query({ age: { gte: 18 } });
console.log('Adults', adults);

// Type-safety examples (compile-time):
// users.get(123) // <-- compile error: Argument of type 'number' is not assignable to parameter of type 'string'.
// users.create({ id: 1, name: 'X' }) // <-- compile error: if id typed as string
