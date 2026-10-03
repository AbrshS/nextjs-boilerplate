---
name: 6-async-bullmq-worker
description: Asynchronous queue architecture with standalone BullMQ WorkerHost and resilient Redis connections.
---

# Skill 6: Asynchronous BullMQ Queue Workers & Redis Resilience

This skill directs the asynchronous background job architecture in `backend/`, ensuring zero CPU contention on the HTTP API event loop.

## 1. Dual-Process Architecture
The backend is strictly divided into two independent execution contexts:
1. **API Process (`main.ts`)**:
   - Boots the Express HTTP server and Socket.IO WebSocket gateway.
   - Producers push jobs to queues (e.g., `this.mailQueue.add("sendEmail", payload)`).
   - Never executes CPU-intensive rendering or heavy batch I/O.
2. **Worker Process (`main-worker.ts`)**:
   - Boots a lightweight NestJS standalone application context:
     `NestFactory.createApplicationContext(AppModule)`.
   - BullMQ `WorkerHost` instances consume jobs, retry failures, and dispatch emails or reports.

## 2. Non-Negotiable Redis Invariant: `maxRetriesPerRequest: null`
BullMQ requires blocking Redis commands (`BRPOPLPUSH`, `BLMOVE`). When instantiating Redis connections for BullMQ queues and workers, you MUST set:

```typescript
connection: {
  host: configService.get('REDIS_HOST'),
  port: configService.get('REDIS_PORT'),
  password: configService.get('REDIS_PASSWORD'),
  maxRetriesPerRequest: null, // REQUIRED BY BULLMQ
  enableReadyCheck: false,
}
```
Failing to specify `maxRetriesPerRequest: null` will cause runtime uncaught exceptions in BullMQ worker hosts.

## 3. Implementing a Dedicated Worker Host
Workers extend `@nestjs/bullmq` `WorkerHost` and process jobs asynchronously:

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'confirmEmail':
        return this.handleConfirmEmail(job.data);
      case 'resetPassword':
        return this.handleResetPassword(job.data);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }
}
```

## 4. Local Execution Commands
```bash
# Start API dev server (HTTP + WebSockets)
npm --prefix backend run start:dev

# Start standalone background worker in separate terminal
npm --prefix backend run start:worker:dev
```
