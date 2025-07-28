// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './common/health/health.module';
import { KafkaService } from './common/kafka/kafka.service';
import { AiSupportChatModule } from './chat/apps/ai-support/ai-support.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    AiSupportChatModule,
  ],
  providers: [KafkaService],
})
export class AppModule {}
