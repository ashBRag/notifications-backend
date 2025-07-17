import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { WebSocketHealthIndicator } from './websocket-health.indicator';
import { ConfigModule } from '@nestjs/config';
import { KafkaHealthIndicator } from './kafka-health.indicator';
import { KafkaService } from '../kafka/kafka.service';

/** This is a module that imports the TerminusModule and includes a HealthController. */
@Module({
  imports: [TerminusModule, ConfigModule],
  controllers: [HealthController],
  providers: [WebSocketHealthIndicator, KafkaHealthIndicator, KafkaService],
})
export class HealthModule {}
