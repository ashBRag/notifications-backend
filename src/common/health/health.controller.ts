import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { WebSocketHealthIndicator } from './websocket-health.indicator';
import { KafkaHealthIndicator } from './kafka-health.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private ws: WebSocketHealthIndicator,
    private kafka: KafkaHealthIndicator,
    private config: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    // Environment-specific thresholds
    const memoryThreshold = this.config.get<number>(
      'HEALTH_MEMORY_THRESHOLD',
      200 * 1024 * 1024,
    );
    const diskThreshold = this.config.get<number>(
      'HEALTH_DISK_THRESHOLD',
      0.85,
    );

    return this.health.check([
      () => this.memory.checkHeap('memory_heap', memoryThreshold),
      () => this.memory.checkRSS('memory_rss', memoryThreshold),
      () =>
        this.disk.checkStorage('storage', {
          thresholdPercent: diskThreshold,
          path: '/',
        }),
      () => this.kafka.isHealthy('kafka'),
      () =>
        this.ws.isHealthy('websocket', {
          timeout: this.config.get('HEALTH_WS_TIMEOUT', 3000),
        }),
    ]);
  }
}
