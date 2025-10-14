# Generic Data Store (TypeScript)

![build](https://github.com/luckyhegde6/ts104/actions/workflows/ci.yml/badge.svg)
![coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)

[![Coverage](coverage/badge.svg)](https://luckyhegde6.github.io/ts104/coverage/)

A lightweight, in-memory, type-safe generic DataStore demonstrating advanced TypeScript features:
- Generics with constraints
- Mapped and conditional types
- Typed query filters, pagination & sorting
- Transaction support, logger injection
- Unit tests with Jest

## Requirements
- Node 22+
- npm
- TypeScript >= 4.9 (devDep uses 5.x)

## Install & Run
```bash
git clone <this-repo>
npm install
npm run build
npm test
```

## Quick usage

See examples/demo.ts. Minimal snippet:
```typescript
import { DataStore } from './src/datastore';

interface User { id: string; name: string; email: string; createdAt: Date; }

const ds = new DataStore<User, 'id'>('id');

const u = ds.create({ name: 'Ana', email: 'a@x.com', createdAt: new Date() });
const found = ds.get(u.id);
```

## Goals & Coverage

Aim for >80% coverage. Run npm test to see coverage report.

## 📚 Documentation
- [LEARNING.md](./docs/LEARNING.md): In-depth explanation of TypeScript concepts used.
- [Overview.md](./docs/Overview.md): Detailed reference for the DataStore class.