import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication, Logger } from '@nestjs/common';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  protected readonly logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

  constructor(private readonly app: INestApplication) {
    super(app);
  }

  connectToRedis(): void {
    try {
      const password = process.env.REDIS_PASSWORD?.trim();
      const host = process.env.REDIS_HOST || 'localhost';
      const useTls =
        host.includes('serverless') ||
        host.includes('cache.amazonaws.com') ||
        host.includes('elasticache');

      const options = {
        host,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        ...(password ? { password } : {}),
        ...(useTls ? { tls: {} } : {}),
        maxRetriesPerRequest: null,
        connectTimeout: 10000,
        retryStrategy: (times: number) => Math.min(times * 100, 3000),
      };

      const pubClient = new Redis(options);
      const subClient = pubClient.duplicate();

      pubClient.on('error', (err) =>
        this.logger.warn(`Redis pub client error: ${err.message}`),
      );
      subClient.on('error', (err) =>
        this.logger.warn(`Redis sub client error: ${err.message}`),
      );

      // Gracefully catch unsupported psubscribe on cloud managed Redis
      const originalPsubscribe = subClient.psubscribe.bind(subClient);
      subClient.psubscribe = (...args: any[]) => {
        return originalPsubscribe(...args).catch((err: any) => {
          this.logger.warn(
            `Redis subClient psubscribe skipped/unsupported: ${err?.message}`,
          );
          return null;
        });
      };

      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.logger.log('Socket.IO Redis clustered adapter initialized successfully');
    } catch (error: any) {
      this.logger.error(
        `Failed to connect Socket.IO to Redis, falling back to default adapter: ${error?.message}`,
      );
    }
  }

  createIOServer(port: number, options?: ServerOptions) {
    const serverOptions = {
      cors: {
        origin: process.env.FRONTEND_DOMAIN || 'http://localhost:3000',
        credentials: true,
      },
      path: process.env.WS_PATH || '/socket.io',
      ...options,
    };
    const server = super.createIOServer(port, serverOptions);
    if (this.adapterConstructor) {
      try {
        server.adapter(this.adapterConstructor);
      } catch (err: any) {
        this.logger.warn(
          `Failed to attach Socket.IO Redis adapter; falling back to in-memory adapter: ${err?.message}`,
        );
      }
    }
    return server;
  }
}
