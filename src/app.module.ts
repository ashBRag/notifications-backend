// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './common/health/health.module';
import { KafkaService } from './common/kafka/kafka.service';
import { ChatGateway } from './chat/shared/chat.gateway';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HealthModule],
  providers: [KafkaService, ChatGateway],
})
export class AppModule {}
