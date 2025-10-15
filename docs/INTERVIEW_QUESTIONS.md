# Interview Questions – Generic Data Store

This document compiles likely interview questions, explanations, and short answer cues.  
It focuses on **TypeScript generics, mapped types, constraints, design patterns**, and reasoning behind architectural choices in this project.

---

## 1. Generics and Type Constraints

**Q:** Why did you use `DataStore<T, K extends keyof T>`?

**A:**  
Because the second type parameter `K` (the primary key name) must be a property of `T`.  
Using `extends keyof T` restricts the allowed values for `K` to only keys actually existing on `T`, ensuring compile-time type safety.

**Q:** What does `T extends Record<K, any>` ensure?  
**A:**  
It ensures that `T` is an object type with at least one key of type `K`.  
This lets us safely access `T[K]` and know it exists.

**Q:** Why is the default type parameter written as `K = 'id'`?  
**A:**  
To provide ergonomic defaults — most entities use an `id` field as their primary key.  
It reduces boilerplate when the key field is `id`.

**Q:** How are generic constraints different from runtime checks?  
**A:**  
TypeScript constraints exist only at compile time to enforce correctness of usage.  
Runtime logic (like duplicate key detection) is implemented separately inside the class.

---

## 2. Mapped Types

**Q:** What is a mapped type? Give an example from this project.  
**A:**  
Mapped types transform each property of another type.  
In this project, the type:

```ts
type Filter<T> = {
  [P in keyof T]?: FieldFilter<T[P]>;
};
```

creates a new object type where each field in T is mapped to a FieldFilter depending on the field’s type.

**Q:** Why use mapped types instead of Record<string, any> for filters?
**A:**  
Because Record<string, any> loses all type information — we couldn’t know which operators apply to each field.
Mapped types preserve the relationship between field name and its original type, enabling contextual operators (like between for numbers).

**Q:** How does Partial<Omit<T, K>> in Update<T> use mapped types?
**A:**  
```ts
type Update<T, K extends keyof T> = Partial<Omit<T, K>>;
```
Partial is itself a built-in mapped type — it marks all properties optional.
We combine it with Omit<T, K> to exclude the key field from updates.

## 3. Conditional Types

**Q:** Explain how conditional types appear in this codebase.
**A:**
The type FieldFilter<V> uses conditional branching on V:
```ts
export type FieldFilter<V> =
  V extends string ? { eq?: V; contains?: string } :
  V extends number ? { eq?: V; between?: [V,V]; gt?: V } :
  V extends Date ? { before?: V; after?: V } :
  { eq?: V };

```
At compile time, the compiler selects the correct structure depending on the field’s type.

**Q:** What benefit do conditional types bring here?
**A:**
They provide contextual intelligence — when a property is a string, auto-completion shows string operators; for number, it shows numeric operators.
It’s a strong real-world demo of how conditional types power expressive domain-specific APIs.

## 4. Utility Types & Inference

**Q:** Why use Omit, Partial, and Pick utilities?
**A:**
Omit removes properties from an object, Partial
To manipulate object shapes safely.
Create<T> and Update<T> derive DTOs automatically from the entity type, eliminating duplicate interface definitions.

**Q:** How do you ensure a developer can’t update the primary key field?
**A:**
Update<T, K> is defined as Partial<Omit<T, K>>, which removes the key field K from the allowed update shape at compile time.

## 5. Design & Patterns

**Q:** Which design pattern does the DataStore implement?
**A:** It resembles the Repository Pattern — abstracting CRUD operations behind a type-safe interface, isolating data access logic from domain entities.

**Q:** Why did you choose Map as internal storage?
**A:** Map provides O(1) access, maintains key insertion order, and is serializable for in-memory DB simulations.

**Q:** Explain the plugin pattern for logging.
**A:** The constructor accepts any Logger implementing { debug/info/warn/error }. This is a form of Dependency Injection — allowing decoupling between business logic and side effects.

**Q:** What are trade-offs of in-memory transaction snapshots?
**A:** They’re simple but not memory-efficient for large datasets. Copying a Map gives rollback ability but is not suitable for production persistence — perfect for demonstrating conceptual atomicity.

## 6. Type Safety and Compile-time Validation

**Q:** How does the compiler prevent misuse of field names?
**A:** By using keyof T for any parameter that expects field names (sortBy, Filter<T>).
Any attempt to sort or filter by a non-existent property causes a compile error.

**Q:** How does TypeScript detect invalid types in create()?
**A:** The Create<T> type defines which fields are required vs optional.
If the developer misses a required field (like name in User), the compiler complains before runtime.

## 7. Architecture and Extensibility

**Q:** How could you extend this DataStore to support persistence?
**A:** Replace the internal Map with an adapter implementing the same CRUD contract (e.g., an interface IStorageBackend).
This keeps the DataStore generic and testable.

**Q:** How could you generalize query filters to handle nested objects?
**A:** By recursively defining Filter<T> — using conditional recursion with T[P] extends object ? Filter<T[P]> : FieldFilter<T[P]>.
By recursively defining Filter<T> — using conditional recursion with T[P] extends object ? Filter<T[P]> : FieldFilter<T[P]>.

## 8. Behavioral & Leadership Angles

**Q:** How would you mentor a junior developer using this project?
**A:** Start from the README, then guide them through types.ts to see real generics in practice.
Explain how type transformations help build expressive APIs without runtime cost. 


**Q:** How would you handle performance vs type complexity trade-offs?
**A:**
Favor maintainability and developer experience first.
In TypeScript libraries, compile-time clarity is more valuable than micro-optimizing in-memory filters.

## 9. Sample Advanced Prompts

What are distributive conditional types?

How would you implement type-safe joins between two DataStores?

How does TypeScript infer generic parameters in method calls without explicit annotation?

### Key takeaway

This project is a perfect demonstration of practical type-driven design — using the compiler as a design assistant, not just a guard.

---
