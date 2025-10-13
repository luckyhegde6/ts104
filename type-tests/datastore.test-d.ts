import { expectType, expectError } from 'tsd';
import { DataStore, Create, Update, Filter } from '../src';

interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
}

// --- 1. Basic generics ---
const users = new DataStore<User, 'id'>('id');

// Type inference for key
const user = users.create({ name: 'Ana', email: 'a@x.com', createdAt: new Date() });
expectType<string>(user.id);

// Invalid key type should error
expectError(users.get(123)); // ❌ number not allowed, id is string

// --- 2. Create<T,K> behavior ---
const withCustomId: Create<User> = { id: 'custom', name: 'Sam', email: 's@x.com', createdAt: new Date() };
expectType<string | undefined>(withCustomId.id);

// Missing required field should error
expectError(users.create({ email: 'e@x.com', createdAt: new Date() })); // name missing

// --- 3. Update<T,K> behavior ---
const patch: Update<User> = { age: 32 };
expectType<number | undefined>(patch.age);

// Should not allow updating the key
expectError<Update<User>>({ id: 'not-allowed' });

// --- 4. Filter<T> typing ---
const filter: Filter<User> = {
  name: { contains: 'Ana' },
  age: { between: [18, 40] },
  createdAt: { after: new Date() }
};
expectType<Filter<User>>(filter);

// Invalid operator for number field
expectError<Filter<User>>({
  age: { contains: 'nope' } // ❌ 'contains' not valid for number
});

// Invalid property should error
expectError<Filter<User>>({
  salary: { eq: 100 } // ❌ property doesn't exist on User
});
