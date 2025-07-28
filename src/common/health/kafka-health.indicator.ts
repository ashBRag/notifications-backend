// common/health/kafka-health.indicator.ts
import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class KafkaHealthIndicator {
  constructor(private readonly kafkaService: KafkaService) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Test producer connection
      await this.kafkaService.healthCheck();
      return {
        [key]: {
          status: 'up',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const result = {
        [key]: {
          status: 'down',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      };
      throw new HealthCheckError('Kafka health check failed', result);
    }
  }
}
