# Project Overview – Generic Data Store

The **Generic Data Store** project demonstrates how advanced TypeScript features can be used to design a small but realistic in-memory database API that is completely type-safe at compile time.

---

## 1. Core Concept

The `DataStore<T, K extends keyof T = 'id'>` class acts as a generic, strongly-typed repository for any entity type `T`.  
It supports CRUD, filtering, sorting, pagination, and simple transactions — all without losing type safety.

```ts
const users = new DataStore<User, 'id'>('id');
users.create({ name: 'Alice', email: 'a@x.com', createdAt: new Date() });
```
Attempting to use an invalid field name or data type fails at compile time.

## 2. Generic Constraints (extends and keyof)

Type constraints narrow down what kind of types can fill a generic parameter.
For example:
```ts
class DataStore<T extends Record<K, any>, K extends keyof T = 'id'> { ... }
```
- T extends Record<K, any> ensures that whatever entity type is passed must contain the key K.

- K extends keyof T limits possible keys to actual field names of T.

This constraint ensures you cannot create a store keyed by a property that doesn’t exist.

Another constraint example:
```ts
type Update<T, K extends keyof T = 'id'> = Partial<Omit<T, K>>;
// The Update type allows partial updates to T, but excludes the primary key K.
```
Here Omit<T, K> removes the primary key, and Partial makes all other fields optional — guaranteeing you can’t accidentally mutate the key.

---

## 3. Mapped Types

Mapped types transform one type into another by iterating over its keys.

Example from the code:
```ts
export type Filter<T> = {
  [P in keyof T]?: FieldFilter<T[P]>;
};

```
For each property in T, we build a filter configuration using FieldFilter<T[P]>.
This keeps the filters aligned with entity shape automatically.
When a developer renames or adds a property, the filters adapt instantly — zero maintenance.

Why use mapped types?

- They preserve relationships between keys and values.

- They reduce duplication of interfaces.

- They make the API self-documenting through IntelliSense.

---

## 4. Conditional Types

Conditional types let you create logic in the type system itself.

FieldFilter<V> changes structure based on the type of field V:

```ts
export type FieldFilter<V> =
  V extends string ? { eq?: V; contains?: string; startsWith?: string } :
  V extends number ? { eq?: V; between?: [V, V]; gt?: V } :
  V extends Date ? { before?: V; after?: V } :
  { eq?: V };
```

When the compiler sees Filter<User>, it substitutes V with string, number, or Date as appropriate — producing field-aware operator types.

This feature lets the library offer a mini domain-specific language without runtime reflection.

## 5. Patterns Demonstrated

| Pattern                    | Where                         | Purpose                                        |
| -------------------------- | ----------------------------- | ---------------------------------------------- |
| **Repository Pattern**     | `DataStore` class             | Abstracts data access behind generic interface |
| **Dependency Injection**   | `Logger` interface            | Externalized side effects and testing          |
| **DTO Derivation**         | `Create<T>`, `Update<T>`      | Uses `Omit` + `Partial` to derive input types  |
| **Functional Composition** | `Filter<T>` with `$and`/`$or` | Declarative query logic                        |
| **Transactional Snapshot** | `transaction(fn)`             | Demonstrates atomic operations in-memory       |

Each pattern contributes to clarity and testability — key traits for senior-level engineering work.

## 6. Example of Generics in Context
```
interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
}

const products = new DataStore<Product, 'id'>('id');

const cheap = products.query({
  price: { lt: 10 },         // numeric operator available
  name: { contains: 'pen' }  // string operator available
});
```
The compiler infers correct operator types based on property type, ensuring misuse (like price.contains) causes an error before runtime.

## 7. Project Structure Explained
```
generic-data-store/
├─ src/                 # TypeScript source files
│  ├─ datastore.ts      # Core DataStore<T,K> implementation
│  ├─ types.ts          # Generic and mapped type definitions
│  ├─ logger.ts         # Logger interface and ConsoleLogger
│  └─ index.ts          # Barrel export
│
├─ examples/            # Demo scripts showing usage
│  └─ demo.ts
│
├─tests/           # Jest test suite
│  └─ datastore.test.ts
│
├─ guides/              # Learning documentation
│  ├─ constraints.md
│  ├─ mapped-types.md
│  ├─ conditional-types.md
│  └─ patterns.md
│
├─ docs/                # HLD and LLD design docs
│  ├─ HLD.md
|  ├─ LEARNING.md             # Explains advanced TypeScript features
│  ├─ Overview.md             # Architectural and educational summary
│  └─ INTERVIEW_QUESTIONS.md  # This file — interview prep material
│
├─ README.md               # Project overview & setup
├─ tsconfig.json
├─ jest.config.ts
├─ package.json
├─ .eslintrc.js
└─ .prettierrc
```

Each directory has a clear purpose:

- src/ — production code.

- examples/ — usage demonstrations.

- tests/ — automated tests.

- guides/ — educational deep dives into TypeScript mechanisms.

- docs/ — design and architecture documents for interviews and technical discussions.

