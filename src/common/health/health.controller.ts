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

  private readonly services = [
    { name: 'ai-support-chat', port: 8000, namespace: '/ai-support' },
    //{ name: 'sales-chat', port: 3002, namespace: '/sales' },
    //{ name: 'internal-chat', port: 3003, namespace: '/internal' },
  ];

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

    // Create WebSocket health checks for all services
    const websocketChecks = this.services.map(
      (service) => () =>
        this.ws.isHealthy(`${service.name}-websocket`, {
          url: `http://localhost:${service.port}${service.namespace}`,
          timeout: this.config.get('HEALTH_WS_TIMEOUT', 5000),
          validateConnection: true,
        }),
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
      ...websocketChecks,
    ]);
  }
}
