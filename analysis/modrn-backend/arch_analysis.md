# Architectural Analysis: `modrn-backend`

## 1. Hexagonal Architecture with Prisma 7

`modrn-backend` rigorously enforces the Ports and Adapters (Hexagonal) pattern:
```
src/<feature>/
├── domain/
│   └── <feature>.ts            # Pure domain model, no ORM decorators
├── dto/
│   ├── create-<feature>.dto.ts # Request validation contracts
│   └── update-<feature>.dto.ts
├── infrastructure/
│   └── persistence/
│       ├── <feature>.repository.ts            # Abstract port (repository interface)
│       └── relational/
│           ├── mappers/
│           │   └── <feature>-prisma.mapper.ts # Pure adapter (data mapping)
│           ├── repositories/
│           │   └── <feature>-prisma.repository.ts # Adapter implementation
│           └── relational-persistence.module.ts
├── <feature>.service.ts        # Application service consuming repository port
├── <feature>.controller.ts     # Primary adapter (HTTP REST)
└── <feature>.module.ts         # Module wiring
```

### Key Benefits:
- **Zero ORM Vendor Lock-in**: If Prisma is swapped with Drizzle, Kysely, or TypeORM, not a single line of business logic in `<feature>.service.ts` or `domain/<feature>.ts` requires modification.
- **Pure Unit Testing**: Services can be tested with standard mock repository classes without requiring an in-memory database or mocking complicated Prisma client queries.

---

## 2. Distributed Asynchronous Processing (BullMQ & Redis)

1. **Decoupled Workloads**:
   - Heavy tasks (email templating with Handlebars, image resizing, PDF contract stamping, license verification) are converted into BullMQ jobs.
   - HTTP requests respond immediately with `202 Accepted` or `201 Created`.
2. **Cluster-Safe Workers**:
   - BullMQ queue locking and retries run over Redis (`ioredis`).
   - The worker process (`main-worker.ts`) consumes jobs using `WorkerHost` with automatic exponential backoff.

---

## 3. Real-Time Event Fan-Out (WebSockets + Redis Pub/Sub)

- Socket.IO cluster is coordinated across multiple Node.js server processes via `@socket.io/redis-adapter`.
- When an event occurs on Server A (e.g. an admin approves a license), Server A emits to Redis Pub/Sub; Server B and Server C broadcast the message to their connected client WebSocket sockets seamlessly.
- Includes TLS encryption and automatic cloud Redis command fallback.

---

## 4. Multi-Tenant Device Auditing via `AsyncLocalStorage`

- Captures client metadata at the HTTP boundary.
- Context is held in thread-local storage (`AsyncLocalStorage`) throughout the promise lifecycle.
- When audit logs, session entries, or security events are written, the metadata is available globally without passing request objects down into domain services.
