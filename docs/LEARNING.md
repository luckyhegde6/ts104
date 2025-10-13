# LEARNING: Advanced TypeScript Concepts used in Generic Data Store

This doc explains the major TypeScript constructs used.

## 1. Generic constraints
We define DataStore<T, K extends keyof T> to make sure the primary key field is one of the properties of T.

## 2. Mapped Types
`Filter<T>` is a mapped type: for each property P in T we map to `FieldFilter<T[P]>`. This produces an object where each field can accept differing operators depending on the underlying type.

Example:
```ts
type Filter<User> = {
  id?: FieldFilter<string>;
  name?: FieldFilter<string>;
  age?: FieldFilter<number>;
}
```
## 3. Conditional Types

FieldFilter<V> is conditional on the field's type (V extends string ? ... : V extends number ? ... : ...). This allows us to provide type-appropriate operators (like contains for strings, between for numbers/dates).

## 4. Utility types

We use Omit, Partial, Pick to craft Create<T>, Update<T> ensuring at compile time that the API surface is safe and clear.

## 5. Practical patterns

Create<T> allows the primary key optionally for convenience; runtime enforces auto-gen only for string keys.

Transactions use a snapshot (Map clone) and rollback on throw.